"""Tests for backend/routers/students.py — CRUD, filters, resume + photo uploads."""
from routers import students as students_router


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------


def test_create_student(client):
    resp = client.post(
        "/api/students",
        json={
            "firstName": "Ada",
            "lastName": "Lovelace",
            "email": "ada@example.com",
            "bio": "Math pioneer",
            "location": "London",
            "skills": "math, analytical engines",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["id"] >= 1
    assert body["firstName"] == "Ada"
    assert body["isActive"] == 1


def test_create_student_duplicate_email(client, make_student):
    s = make_student(email="dup@example.com")
    resp = client.post(
        "/api/students",
        json={
            "firstName": "Other",
            "lastName": "Person",
            "email": s["email"],
        },
    )
    assert resp.status_code == 409


def test_list_students(client, make_student):
    make_student()
    make_student()
    resp = client.get("/api/students")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_list_students_filter_search(client, make_student):
    make_student(firstName="Grace", lastName="Hopper")
    make_student(firstName="Ada", lastName="Lovelace")
    resp = client.get("/api/students", params={"search": "Grace"})
    assert resp.status_code == 200
    names = [f"{s['firstName']} {s['lastName']}" for s in resp.json()]
    assert names == ["Grace Hopper"]


def test_list_students_filter_location(client, make_student):
    make_student(location="Dallas, TX")
    make_student(location="NYC")
    resp = client.get("/api/students", params={"location": "Dallas"})
    assert [s["location"] for s in resp.json()] == ["Dallas, TX"]


def test_list_students_filter_skills(client, make_student):
    make_student(skills="python, react")
    make_student(skills="java, spring")
    resp = client.get("/api/students", params={"skills": "react"})
    assert [s["skills"] for s in resp.json()] == ["python, react"]


def test_list_students_filter_isactive(client, make_student):
    make_student()
    s2 = make_student()
    client.delete(f"/api/students/{s2['id']}")  # soft-delete
    active = client.get("/api/students", params={"isActive": 1}).json()
    inactive = client.get("/api/students", params={"isActive": 0}).json()
    assert len(active) == 1
    assert len(inactive) == 1


def test_get_student(client, make_student):
    s = make_student()
    resp = client.get(f"/api/students/{s['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == s["id"]


def test_get_student_404(client):
    assert client.get("/api/students/9999").status_code == 404


def test_update_student(client, make_student):
    s = make_student()
    resp = client.put(
        f"/api/students/{s['id']}",
        json={"bio": "Updated bio", "location": "Remote"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["bio"] == "Updated bio"
    assert body["location"] == "Remote"
    # Unchanged fields remain.
    assert body["firstName"] == s["firstName"]


def test_update_student_404(client):
    resp = client.put("/api/students/9999", json={"bio": "x"})
    assert resp.status_code == 404


def test_deactivate_student(client, make_student):
    s = make_student()
    resp = client.delete(f"/api/students/{s['id']}")
    assert resp.status_code == 200
    # Row still exists but isActive=0 (soft delete).
    got = client.get(f"/api/students/{s['id']}").json()
    assert got["isActive"] == 0


def test_deactivate_student_404(client):
    assert client.delete("/api/students/9999").status_code == 404


# ---------------------------------------------------------------------------
# Resume upload/download
# ---------------------------------------------------------------------------


def _link_student(client, user, student_id, auth_headers):
    """Link the authed user to a student profile via POST /api/auth/link-profile."""
    resp = client.post(
        f"/api/auth/link-profile/{student_id}",
        headers=auth_headers(user),
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]


def test_upload_resume_owner_success(
    client, make_user, make_student, auth_headers, pdf_bytes
):
    user = make_user(role="student")
    student = make_student()
    token = _link_student(client, user, student["id"], auth_headers)

    resp = client.post(
        f"/api/students/{student['id']}/resume",
        headers={"Authorization": f"Bearer {token}"},
        files={"resume": ("my.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["resumeLink"] == f"/api/students/{student['id']}/resume/download"

    # File landed on disk at the monkeypatched UPLOAD_ROOT.
    target = students_router.UPLOAD_ROOT / f"{student['id']}.pdf"
    assert target.exists()
    assert target.read_bytes() == pdf_bytes


def test_upload_resume_admin_allowed_for_any_student(
    client, make_user, make_student, auth_headers, pdf_bytes
):
    admin = make_user(role="admin")
    student = make_student()
    resp = client.post(
        f"/api/students/{student['id']}/resume",
        headers=auth_headers(admin),
        files={"resume": ("x.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 200


def test_upload_resume_non_owner_forbidden(
    client, make_user, make_student, auth_headers, pdf_bytes
):
    other_user = make_user(role="student")
    student = make_student()
    # Link other_user to a different profile id so they're not the owner.
    different_profile = make_student()
    _link_student(client, other_user, different_profile["id"], auth_headers)
    # Use the updated token by re-logging in.
    login = client.post(
        "/api/auth/login",
        json={"email": other_user["email"], "password": other_user["password"]},
    ).json()
    resp = client.post(
        f"/api/students/{student['id']}/resume",
        headers={"Authorization": f"Bearer {login['access_token']}"},
        files={"resume": ("x.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 403


def test_upload_resume_unauth(client, make_student, pdf_bytes):
    student = make_student()
    resp = client.post(
        f"/api/students/{student['id']}/resume",
        files={"resume": ("x.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 403  # HTTPBearer rejects missing header as 403


def test_upload_resume_rejects_wrong_content_type(
    client, make_user, make_student, auth_headers, pdf_bytes
):
    admin = make_user(role="admin")
    student = make_student()
    resp = client.post(
        f"/api/students/{student['id']}/resume",
        headers=auth_headers(admin),
        files={"resume": ("x.txt", pdf_bytes, "text/plain")},
    )
    assert resp.status_code == 400
    assert "PDF" in resp.json()["detail"]


def test_upload_resume_rejects_wrong_magic_bytes(
    client, make_user, make_student, auth_headers, not_pdf_bytes
):
    admin = make_user(role="admin")
    student = make_student()
    resp = client.post(
        f"/api/students/{student['id']}/resume",
        headers=auth_headers(admin),
        files={"resume": ("x.pdf", not_pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 400
    assert "Invalid" in resp.json()["detail"]


def test_upload_resume_rejects_oversize(
    client, make_user, make_student, auth_headers, oversize_pdf_bytes
):
    admin = make_user(role="admin")
    student = make_student()
    resp = client.post(
        f"/api/students/{student['id']}/resume",
        headers=auth_headers(admin),
        files={"resume": ("x.pdf", oversize_pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 400
    assert "too large" in resp.json()["detail"].lower()
    # No leftover .uploading temp files.
    leftovers = list(students_router.UPLOAD_ROOT.glob("*.uploading"))
    assert leftovers == []


def test_upload_resume_student_not_found(
    client, make_user, auth_headers, pdf_bytes
):
    admin = make_user(role="admin")
    resp = client.post(
        "/api/students/9999/resume",
        headers=auth_headers(admin),
        files={"resume": ("x.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 404


def test_download_resume_success(
    client, make_user, make_student, auth_headers, pdf_bytes
):
    admin = make_user(role="admin")
    student = make_student()
    client.post(
        f"/api/students/{student['id']}/resume",
        headers=auth_headers(admin),
        files={"resume": ("x.pdf", pdf_bytes, "application/pdf")},
    )
    resp = client.get(
        f"/api/students/{student['id']}/resume/download",
        headers=auth_headers(admin),
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content == pdf_bytes


def test_download_resume_unauth(client, make_student):
    student = make_student()
    resp = client.get(f"/api/students/{student['id']}/resume/download")
    assert resp.status_code == 403


def test_download_resume_no_file(client, make_user, make_student, auth_headers):
    admin = make_user(role="admin")
    student = make_student()
    resp = client.get(
        f"/api/students/{student['id']}/resume/download",
        headers=auth_headers(admin),
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Profile photo upload/download
# ---------------------------------------------------------------------------


def test_upload_profile_photo_jpeg(
    client, make_user, make_student, auth_headers, jpeg_bytes
):
    user = make_user(role="student")
    student = make_student()
    token = _link_student(client, user, student["id"], auth_headers)
    resp = client.post(
        f"/api/students/{student['id']}/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profile_photo": ("a.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert resp.status_code == 200, resp.text
    assert (students_router.PROFILE_PHOTO_UPLOAD_ROOT / f"{student['id']}.jpg").exists()


def test_upload_profile_photo_png(
    client, make_user, make_student, auth_headers, png_bytes
):
    user = make_user(role="student")
    student = make_student()
    token = _link_student(client, user, student["id"], auth_headers)
    resp = client.post(
        f"/api/students/{student['id']}/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profile_photo": ("a.png", png_bytes, "image/png")},
    )
    assert resp.status_code == 200


def test_upload_profile_photo_webp(
    client, make_user, make_student, auth_headers, webp_bytes
):
    user = make_user(role="student")
    student = make_student()
    token = _link_student(client, user, student["id"], auth_headers)
    resp = client.post(
        f"/api/students/{student['id']}/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profile_photo": ("a.webp", webp_bytes, "image/webp")},
    )
    assert resp.status_code == 200


def test_upload_profile_photo_admin_forbidden(
    client, make_user, make_student, auth_headers, jpeg_bytes
):
    # Asymmetry with resume: admin is NOT allowed to upload a student's photo.
    admin = make_user(role="admin")
    student = make_student()
    resp = client.post(
        f"/api/students/{student['id']}/profile-photo",
        headers=auth_headers(admin),
        files={"profile_photo": ("a.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert resp.status_code == 403


def test_upload_profile_photo_wrong_content_type(
    client, make_user, make_student, auth_headers, jpeg_bytes
):
    user = make_user(role="student")
    student = make_student()
    token = _link_student(client, user, student["id"], auth_headers)
    resp = client.post(
        f"/api/students/{student['id']}/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profile_photo": ("a.gif", jpeg_bytes, "image/gif")},
    )
    assert resp.status_code == 400


def test_upload_profile_photo_bad_magic_bytes(
    client, make_user, make_student, auth_headers
):
    user = make_user(role="student")
    student = make_student()
    token = _link_student(client, user, student["id"], auth_headers)
    resp = client.post(
        f"/api/students/{student['id']}/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profile_photo": ("a.jpg", b"not really a jpeg" * 10, "image/jpeg")},
    )
    assert resp.status_code == 400


def test_upload_profile_photo_replaces_existing_extension(
    client, make_user, make_student, auth_headers, jpeg_bytes, png_bytes
):
    user = make_user(role="student")
    student = make_student()
    token = _link_student(client, user, student["id"], auth_headers)

    client.post(
        f"/api/students/{student['id']}/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profile_photo": ("a.jpg", jpeg_bytes, "image/jpeg")},
    )
    client.post(
        f"/api/students/{student['id']}/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profile_photo": ("a.png", png_bytes, "image/png")},
    )
    root = students_router.PROFILE_PHOTO_UPLOAD_ROOT
    assert not (root / f"{student['id']}.jpg").exists()
    assert (root / f"{student['id']}.png").exists()


def test_download_profile_photo_success(
    client, make_user, make_student, auth_headers, jpeg_bytes
):
    user = make_user(role="student")
    student = make_student()
    token = _link_student(client, user, student["id"], auth_headers)
    client.post(
        f"/api/students/{student['id']}/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profile_photo": ("a.jpg", jpeg_bytes, "image/jpeg")},
    )
    resp = client.get(
        f"/api/students/{student['id']}/profile-photo/download",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "image/jpeg"
    assert resp.content == jpeg_bytes


def test_download_profile_photo_unauth(client, make_student):
    student = make_student()
    resp = client.get(f"/api/students/{student['id']}/profile-photo/download")
    assert resp.status_code == 403


def test_download_profile_photo_404_when_missing(
    client, make_user, make_student, auth_headers
):
    admin = make_user(role="admin")
    student = make_student()
    resp = client.get(
        f"/api/students/{student['id']}/profile-photo/download",
        headers=auth_headers(admin),
    )
    assert resp.status_code == 404

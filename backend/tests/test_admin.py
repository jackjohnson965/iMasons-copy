"""Tests for backend/routers/admin.py — role gating, moderation, password reset."""
import pytest


ADMIN_ENDPOINTS = [
    ("GET", "/api/admin/students"),
    ("GET", "/api/admin/job-postings"),
    ("GET", "/api/admin/users"),
]


@pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
def test_admin_endpoint_without_token(client, method, path):
    resp = client.request(method, path)
    assert resp.status_code == 403  # HTTPBearer rejects missing creds


@pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
def test_admin_endpoint_student_forbidden(client, make_user, auth_headers, method, path):
    student = make_user(role="student")
    resp = client.request(method, path, headers=auth_headers(student))
    assert resp.status_code == 403


@pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
def test_admin_endpoint_employer_forbidden(client, make_user, auth_headers, method, path):
    employer = make_user(role="employer")
    resp = client.request(method, path, headers=auth_headers(employer))
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Students moderation
# ---------------------------------------------------------------------------


def test_admin_list_students_includes_hidden(
    client, make_user, make_student, auth_headers
):
    admin = make_user(role="admin")
    s1 = make_student()
    s2 = make_student()
    client.delete(f"/api/students/{s2['id']}")  # soft-delete (hidden)
    resp = client.get("/api/admin/students", headers=auth_headers(admin))
    assert resp.status_code == 200
    ids = {s["id"] for s in resp.json()}
    assert ids == {s1["id"], s2["id"]}


def test_admin_set_student_status_hidden(
    client, make_user, make_student, auth_headers
):
    admin = make_user(role="admin")
    student = make_student()
    resp = client.put(
        f"/api/admin/students/{student['id']}/status",
        json={"status": "hidden"},
        headers=auth_headers(admin),
    )
    assert resp.status_code == 200
    assert resp.json()["isActive"] == 0


def test_admin_set_student_status_active(
    client, make_user, make_student, auth_headers
):
    admin = make_user(role="admin")
    student = make_student()
    client.delete(f"/api/students/{student['id']}")
    resp = client.put(
        f"/api/admin/students/{student['id']}/status",
        json={"status": "active"},
        headers=auth_headers(admin),
    )
    assert resp.status_code == 200
    assert resp.json()["isActive"] == 1


def test_admin_set_student_status_invalid(
    client, make_user, make_student, auth_headers
):
    admin = make_user(role="admin")
    student = make_student()
    resp = client.put(
        f"/api/admin/students/{student['id']}/status",
        json={"status": "banana"},
        headers=auth_headers(admin),
    )
    assert resp.status_code == 422


def test_admin_set_student_status_404(client, make_user, auth_headers):
    admin = make_user(role="admin")
    resp = client.put(
        "/api/admin/students/9999/status",
        json={"status": "hidden"},
        headers=auth_headers(admin),
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Postings moderation
# ---------------------------------------------------------------------------


def test_admin_list_job_postings_all_statuses(
    client, make_user, make_job, auth_headers
):
    admin = make_user(role="admin")
    make_job()
    j2 = make_job()
    client.delete(f"/api/job-postings/{j2['id']}")  # close
    resp = client.get("/api/admin/job-postings", headers=auth_headers(admin))
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_admin_set_posting_status(client, make_user, make_job, auth_headers):
    admin = make_user(role="admin")
    job = make_job()
    resp = client.put(
        f"/api/admin/job-postings/{job['id']}/status",
        json={"status": "archived"},
        headers=auth_headers(admin),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "archived"
    assert body["isActive"] == 0


def test_admin_set_posting_status_invalid(client, make_user, make_job, auth_headers):
    admin = make_user(role="admin")
    job = make_job()
    resp = client.put(
        f"/api/admin/job-postings/{job['id']}/status",
        json={"status": "banana"},
        headers=auth_headers(admin),
    )
    assert resp.status_code == 422


def test_admin_set_posting_status_404(client, make_user, auth_headers):
    admin = make_user(role="admin")
    resp = client.put(
        "/api/admin/job-postings/9999/status",
        json={"status": "closed"},
        headers=auth_headers(admin),
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# User listing + password reset
# ---------------------------------------------------------------------------


def test_admin_list_users_no_passwords(client, make_user, auth_headers):
    admin = make_user(role="admin")
    make_user(role="student")
    resp = client.get("/api/admin/users", headers=auth_headers(admin))
    assert resp.status_code == 200
    users = resp.json()
    assert len(users) >= 2
    for u in users:
        assert "hashedPassword" not in u
        assert "password" not in u
        assert set(u.keys()) >= {"id", "email", "role", "imasonsIdentifier"}


def test_admin_password_reset_end_to_end(client, make_user, auth_headers):
    admin = make_user(role="admin")
    student = make_user(role="student")

    # Old password currently works.
    r = client.post(
        "/api/auth/login",
        json={"email": student["email"], "password": student["password"]},
    )
    assert r.status_code == 200

    # Admin resets.
    reset = client.post(
        f"/api/admin/users/{student['userId']}/password-reset",
        headers=auth_headers(admin),
    )
    assert reset.status_code == 200
    body = reset.json()
    temp = body["tempPassword"]
    assert len(temp) == 12

    # Old password no longer works.
    r = client.post(
        "/api/auth/login",
        json={"email": student["email"], "password": student["password"]},
    )
    assert r.status_code == 401

    # New temp password works.
    r = client.post(
        "/api/auth/login",
        json={"email": student["email"], "password": temp},
    )
    assert r.status_code == 200


def test_admin_password_reset_404(client, make_user, auth_headers):
    admin = make_user(role="admin")
    resp = client.post(
        "/api/admin/users/9999/password-reset",
        headers=auth_headers(admin),
    )
    assert resp.status_code == 404

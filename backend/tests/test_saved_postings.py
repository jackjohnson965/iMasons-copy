"""Tests for backend/routers/savedPostings.py — save/list/unsave + cascade."""
from models import SavedPosting


def test_save_posting(client, make_student, make_job):
    student = make_student()
    job = make_job()
    resp = client.post(
        "/api/saved-postings",
        json={"studentId": student["id"], "jobPostingId": job["id"]},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["studentId"] == student["id"]
    assert body["jobPostingId"] == job["id"]


def test_save_posting_unknown_student(client, make_job):
    job = make_job()
    resp = client.post(
        "/api/saved-postings",
        json={"studentId": 9999, "jobPostingId": job["id"]},
    )
    assert resp.status_code == 404


def test_save_posting_unknown_job(client, make_student):
    student = make_student()
    resp = client.post(
        "/api/saved-postings",
        json={"studentId": student["id"], "jobPostingId": 9999},
    )
    assert resp.status_code == 404


def test_save_posting_duplicate(client, make_student, make_job):
    student = make_student()
    job = make_job()
    body = {"studentId": student["id"], "jobPostingId": job["id"]}
    assert client.post("/api/saved-postings", json=body).status_code == 201
    resp = client.post("/api/saved-postings", json=body)
    assert resp.status_code == 409


def test_list_saved_postings_requires_studentid(client):
    resp = client.get("/api/saved-postings")
    assert resp.status_code == 422


def test_list_saved_postings_includes_job(client, make_student, make_job):
    student = make_student()
    job = make_job(title="Software Engineer")
    client.post(
        "/api/saved-postings",
        json={"studentId": student["id"], "jobPostingId": job["id"]},
    )
    resp = client.get("/api/saved-postings", params={"studentId": student["id"]})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["jobPosting"]["title"] == "Software Engineer"


def test_list_saved_postings_scoped_to_student(
    client, make_student, make_job
):
    a = make_student()
    b = make_student()
    job = make_job()
    client.post("/api/saved-postings", json={"studentId": a["id"], "jobPostingId": job["id"]})
    assert len(client.get("/api/saved-postings", params={"studentId": a["id"]}).json()) == 1
    assert client.get("/api/saved-postings", params={"studentId": b["id"]}).json() == []


def test_unsave_posting(client, make_student, make_job):
    student = make_student()
    job = make_job()
    created = client.post(
        "/api/saved-postings",
        json={"studentId": student["id"], "jobPostingId": job["id"]},
    ).json()
    resp = client.delete(f"/api/saved-postings/{created['id']}")
    assert resp.status_code == 200
    assert client.get("/api/saved-postings", params={"studentId": student["id"]}).json() == []


def test_unsave_posting_404(client):
    assert client.delete("/api/saved-postings/9999").status_code == 404


def test_cascade_delete_student_removes_saves(
    client, make_student, make_job, db_session
):
    student = make_student()
    job = make_job()
    client.post(
        "/api/saved-postings",
        json={"studentId": student["id"], "jobPostingId": job["id"]},
    )
    from models import Student

    db_session.delete(db_session.query(Student).filter(Student.id == student["id"]).first())
    db_session.commit()
    assert db_session.query(SavedPosting).count() == 0


def test_cascade_delete_job_removes_saves(
    client, make_student, make_job, db_session
):
    student = make_student()
    job = make_job()
    client.post(
        "/api/saved-postings",
        json={"studentId": student["id"], "jobPostingId": job["id"]},
    )
    from models import JobPosting

    db_session.delete(db_session.query(JobPosting).filter(JobPosting.id == job["id"]).first())
    db_session.commit()
    assert db_session.query(SavedPosting).count() == 0

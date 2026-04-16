"""Tests for backend/routers/jobPostings.py — CRUD, filters, status sync, cascade."""
from models import CustomQuestion, JobPosting


def test_create_job_posting(client, make_employer):
    employer = make_employer()
    resp = client.post(
        "/api/job-postings",
        json={
            "employerId": employer["id"],
            "title": "Backend Intern",
            "description": "Work on FastAPI",
            "location": "Dallas, TX",
            "jobType": "internship",
            "industry": "tech",
            "applicationUrl": "https://company.com/careers/backend-intern",
            "status": "active",
            "customQuestions": [],
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "Backend Intern"
    assert body["status"] == "active"
    assert body["isActive"] == 1
    assert body["applicationUrl"] == "https://company.com/careers/backend-intern"
    assert body["customQuestions"] == []


def test_create_job_posting_with_custom_questions(client, make_employer):
    employer = make_employer()
    resp = client.post(
        "/api/job-postings",
        json={
            "employerId": employer["id"],
            "title": "Frontend Intern",
            "description": "React work",
            "jobType": "internship",
            "applicationUrl": "https://company.com/apply/frontend",
            "customQuestions": [
                {"questionText": "Why are you interested in this role?", "questionOrder": 0},
                {"questionText": "Share a link to a project you're proud of.", "questionOrder": 1},
                {"questionText": "What is your expected graduation date?", "questionOrder": 2},
            ],
        },
    )
    assert resp.status_code == 201
    qs = resp.json()["customQuestions"]
    assert len(qs) == 3
    assert qs[0]["questionText"] == "Why are you interested in this role?"
    assert qs[1]["questionText"] == "Share a link to a project you're proud of."
    assert qs[2]["questionText"] == "What is your expected graduation date?"


def test_create_job_posting_without_application_url(client, make_employer):
    employer = make_employer()
    resp = client.post(
        "/api/job-postings",
        json={
            "employerId": employer["id"],
            "title": "Data Analyst",
            "description": "Analyze data",
            "jobType": "full-time",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["applicationUrl"] == ""


def test_create_job_posting_unknown_employer(client):
    resp = client.post(
        "/api/job-postings",
        json={
            "employerId": 9999,
            "title": "X",
            "description": "Y",
            "jobType": "internship",
        },
    )
    assert resp.status_code == 404


def test_create_job_posting_invalid_status(client, make_employer):
    employer = make_employer()
    resp = client.post(
        "/api/job-postings",
        json={
            "employerId": employer["id"],
            "title": "X",
            "description": "Y",
            "jobType": "internship",
            "status": "banana",
        },
    )
    assert resp.status_code == 422


def test_create_job_posting_invalid_jobtype(client, make_employer):
    import pytest
    from sqlalchemy.exc import IntegrityError

    employer = make_employer()
    with pytest.raises(IntegrityError):
        client.post(
            "/api/job-postings",
            json={
                "employerId": employer["id"],
                "title": "X",
                "description": "Y",
                "jobType": "banana",
            },
        )


def test_create_job_posting_with_realistic_questions(client, make_employer):
    employer = make_employer(companyName="Acme Corp")
    resp = client.post(
        "/api/job-postings",
        json={
            "employerId": employer["id"],
            "title": "Software Engineering Intern",
            "description": "Join our engineering team for a 12-week summer internship.",
            "location": "Austin, TX",
            "jobType": "internship",
            "industry": "Technology",
            "applicationUrl": "https://acme.com/careers/apply/swe-intern-2026",
            "customQuestions": [
                {"questionText": "Why are you interested in working at Acme Corp?", "questionOrder": 0},
                {"questionText": "Describe a technical challenge you overcame and what you learned.", "questionOrder": 1},
                {"questionText": "Are you authorized to work in the United States?", "questionOrder": 2},
                {"questionText": "What is your earliest available start date?", "questionOrder": 3},
            ],
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["applicationUrl"] == "https://acme.com/careers/apply/swe-intern-2026"
    qs = body["customQuestions"]
    assert len(qs) == 4
    assert qs[0]["questionOrder"] == 0
    assert qs[3]["questionOrder"] == 3


def test_list_job_postings_filters(client, make_employer, make_job):
    e1 = make_employer()
    e2 = make_employer()
    make_job(employer=e1, title="Python Dev", jobType="full-time", location="Dallas", industry="tech")
    make_job(employer=e1, title="Go Dev", jobType="part-time", location="NYC", industry="tech")
    make_job(employer=e2, title="Accountant", jobType="full-time", location="Dallas", industry="finance")

    assert len(client.get("/api/job-postings", params={"search": "Python"}).json()) == 1
    assert len(client.get("/api/job-postings", params={"location": "Dallas"}).json()) == 2
    assert len(client.get("/api/job-postings", params={"jobType": "full-time"}).json()) == 2
    assert len(client.get("/api/job-postings", params={"industry": "tech"}).json()) == 2
    assert len(client.get("/api/job-postings", params={"employerId": e1["id"]}).json()) == 2


def test_list_job_postings_includes_application_url(client, make_employer):
    employer = make_employer()
    client.post(
        "/api/job-postings",
        json={
            "employerId": employer["id"],
            "title": "Test",
            "description": "Test",
            "jobType": "internship",
            "applicationUrl": "https://example.com/apply",
        },
    )
    listings = client.get("/api/job-postings").json()
    assert listings[0]["applicationUrl"] == "https://example.com/apply"


def test_list_job_postings_status_filter(client, make_job):
    a = make_job()
    b = make_job()
    client.put(f"/api/job-postings/{b['id']}", json={"status": "closed"})
    active = client.get("/api/job-postings", params={"status": "active"}).json()
    closed = client.get("/api/job-postings", params={"status": "closed"}).json()
    assert [p["id"] for p in active] == [a["id"]]
    assert [p["id"] for p in closed] == [b["id"]]


def test_list_job_postings_legacy_isactive_filter(client, make_job):
    make_job()
    b = make_job()
    client.delete(f"/api/job-postings/{b['id']}")
    assert len(client.get("/api/job-postings", params={"isActive": 1}).json()) == 1
    assert len(client.get("/api/job-postings", params={"isActive": 0}).json()) == 1


def test_get_job_posting_eager_loads_questions(client, make_employer):
    employer = make_employer()
    created = client.post(
        "/api/job-postings",
        json={
            "employerId": employer["id"],
            "title": "X",
            "description": "Y",
            "jobType": "internship",
            "customQuestions": [
                {"questionText": "Tell us about yourself and your career goals."},
                {"questionText": "Do you have experience with cloud platforms (AWS, GCP, Azure)?"},
            ],
        },
    ).json()
    resp = client.get(f"/api/job-postings/{created['id']}")
    assert resp.status_code == 200
    qs = resp.json()["customQuestions"]
    assert len(qs) == 2
    assert "career goals" in qs[0]["questionText"]


def test_get_job_posting_404(client):
    assert client.get("/api/job-postings/9999").status_code == 404


def test_update_job_posting_status_syncs_isactive(client, make_job):
    job = make_job()
    resp = client.put(f"/api/job-postings/{job['id']}", json={"status": "closed"})
    assert resp.status_code == 200
    assert resp.json()["isActive"] == 0
    resp = client.put(f"/api/job-postings/{job['id']}", json={"status": "active"})
    assert resp.json()["isActive"] == 1
    resp = client.put(f"/api/job-postings/{job['id']}", json={"status": "archived"})
    assert resp.json()["isActive"] == 0


def test_update_job_posting_application_url(client, make_job):
    job = make_job()
    resp = client.put(
        f"/api/job-postings/{job['id']}",
        json={"applicationUrl": "https://newurl.com/apply"},
    )
    assert resp.status_code == 200
    assert resp.json()["applicationUrl"] == "https://newurl.com/apply"


def test_update_job_posting_invalid_status(client, make_job):
    job = make_job()
    resp = client.put(f"/api/job-postings/{job['id']}", json={"status": "banana"})
    assert resp.status_code == 422


def test_update_job_posting_404(client):
    resp = client.put("/api/job-postings/9999", json={"title": "X"})
    assert resp.status_code == 404


def test_update_job_posting_fields(client, make_job):
    job = make_job()
    resp = client.put(
        f"/api/job-postings/{job['id']}",
        json={"title": "New Title", "location": "Austin"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["title"] == "New Title"
    assert body["location"] == "Austin"


def test_delete_job_posting_soft_close(client, make_job, db_session):
    job = make_job()
    resp = client.delete(f"/api/job-postings/{job['id']}")
    assert resp.status_code == 200
    row = db_session.query(JobPosting).filter(JobPosting.id == job["id"]).first()
    assert row is not None
    assert row.status == "closed"
    assert row.isActive == 0


def test_delete_job_posting_404(client):
    assert client.delete("/api/job-postings/9999").status_code == 404


def test_cascade_delete_employer_removes_postings_and_questions(
    client, make_employer, db_session
):
    employer = make_employer()
    created = client.post(
        "/api/job-postings",
        json={
            "employerId": employer["id"],
            "title": "X",
            "description": "Y",
            "jobType": "internship",
            "customQuestions": [{"questionText": "Q1"}],
        },
    ).json()
    from models import Employer

    db_employer = db_session.query(Employer).filter(Employer.id == employer["id"]).first()
    db_session.delete(db_employer)
    db_session.commit()
    assert db_session.query(JobPosting).filter(JobPosting.id == created["id"]).first() is None
    assert (
        db_session.query(CustomQuestion)
        .filter(CustomQuestion.jobPostingId == created["id"])
        .first()
        is None
    )

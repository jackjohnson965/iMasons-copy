"""Tests for backend/routers/applications.py — student applications with question answers."""
from models import Application


def test_submit_application_with_answers(client, make_student, make_employer):
    employer = make_employer()
    student = make_student()
    job = client.post("/api/job-postings", json={
        "employerId": employer["id"],
        "title": "SWE Intern",
        "description": "Build things",
        "jobType": "internship",
        "customQuestions": [
            {"questionText": "Why are you interested in this role?", "questionOrder": 0},
            {"questionText": "Describe a project you're proud of.", "questionOrder": 1},
        ],
    }).json()
    qids = [q["id"] for q in job["customQuestions"]]

    resp = client.post("/api/applications", json={
        "studentId": student["id"],
        "jobPostingId": job["id"],
        "answers": [
            {"questionId": qids[0], "answerText": "I love building tools that help people."},
            {"questionId": qids[1], "answerText": "I built a job board matching platform."},
        ],
    })
    assert resp.status_code == 201
    body = resp.json()
    assert body["studentId"] == student["id"]
    assert body["jobPostingId"] == job["id"]
    assert body["status"] == "submitted"
    assert len(body["answers"]) == 2


def test_submit_application_without_questions(client, make_student, make_job):
    student = make_student()
    job = make_job()
    resp = client.post("/api/applications", json={
        "studentId": student["id"],
        "jobPostingId": job["id"],
        "answers": [],
    })
    assert resp.status_code == 201
    assert resp.json()["answers"] == []


def test_duplicate_application_rejected(client, make_student, make_job):
    student = make_student()
    job = make_job()
    client.post("/api/applications", json={
        "studentId": student["id"],
        "jobPostingId": job["id"],
        "answers": [],
    })
    resp = client.post("/api/applications", json={
        "studentId": student["id"],
        "jobPostingId": job["id"],
        "answers": [],
    })
    assert resp.status_code == 409


def test_application_unknown_student(client, make_job):
    job = make_job()
    resp = client.post("/api/applications", json={
        "studentId": 9999,
        "jobPostingId": job["id"],
        "answers": [],
    })
    assert resp.status_code == 404


def test_application_unknown_posting(client, make_student):
    student = make_student()
    resp = client.post("/api/applications", json={
        "studentId": student["id"],
        "jobPostingId": 9999,
        "answers": [],
    })
    assert resp.status_code == 404


def test_list_applications_by_posting(client, make_student, make_employer):
    employer = make_employer()
    job = client.post("/api/job-postings", json={
        "employerId": employer["id"],
        "title": "Data Analyst",
        "description": "Analyze things",
        "jobType": "full-time",
        "customQuestions": [
            {"questionText": "What tools do you use for data analysis?", "questionOrder": 0},
        ],
    }).json()
    qid = job["customQuestions"][0]["id"]

    s1 = make_student()
    s2 = make_student()
    client.post("/api/applications", json={
        "studentId": s1["id"],
        "jobPostingId": job["id"],
        "answers": [{"questionId": qid, "answerText": "Python, SQL, Tableau"}],
    })
    client.post("/api/applications", json={
        "studentId": s2["id"],
        "jobPostingId": job["id"],
        "answers": [{"questionId": qid, "answerText": "R, Excel, Power BI"}],
    })

    resp = client.get("/api/applications", params={"jobPostingId": job["id"]})
    assert resp.status_code == 200
    apps = resp.json()
    assert len(apps) == 2
    assert apps[0]["student"]["firstName"] is not None
    assert apps[0]["answers"][0]["question"]["questionText"] == "What tools do you use for data analysis?"


def test_list_applications_by_employer(client, make_student, make_employer, make_job):
    employer = make_employer()
    job = make_job(employer=employer)
    student = make_student()
    client.post("/api/applications", json={
        "studentId": student["id"],
        "jobPostingId": job["id"],
        "answers": [],
    })

    resp = client.get("/api/applications", params={"employerId": employer["id"]})
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_list_applications_by_student(client, make_student, make_job):
    student = make_student()
    j1 = make_job()
    j2 = make_job()
    client.post("/api/applications", json={"studentId": student["id"], "jobPostingId": j1["id"], "answers": []})
    client.post("/api/applications", json={"studentId": student["id"], "jobPostingId": j2["id"], "answers": []})

    resp = client.get("/api/applications", params={"studentId": student["id"]})
    assert len(resp.json()) == 2


def test_get_application_detail(client, make_application):
    app = make_application()
    resp = client.get(f"/api/applications/{app['id']}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["student"]["firstName"] is not None
    assert len(body["answers"]) == 2
    assert body["answers"][0]["question"]["questionText"] is not None


def test_get_application_404(client):
    assert client.get("/api/applications/9999").status_code == 404


def test_update_application_status(client, make_application):
    app = make_application()
    resp = client.put(f"/api/applications/{app['id']}/status?status=reviewed")
    assert resp.status_code == 200

    detail = client.get(f"/api/applications/{app['id']}").json()
    assert detail["status"] == "reviewed"

    client.put(f"/api/applications/{app['id']}/status?status=accepted")
    detail = client.get(f"/api/applications/{app['id']}").json()
    assert detail["status"] == "accepted"


def test_update_application_invalid_status(client, make_application):
    app = make_application()
    resp = client.put(f"/api/applications/{app['id']}/status?status=banana")
    assert resp.status_code == 422


def test_update_application_404(client):
    resp = client.put("/api/applications/9999/status?status=reviewed")
    assert resp.status_code == 404

def test_submit_application_uses_student_linked_profile_from_token(
    client, make_user, make_student, make_job, auth_headers
):
    user = make_user(role="student")
    student = make_student(email=user["email"])

    # Link the newly created student profile to the authenticated user.
    link_resp = client.post(
        f"/api/auth/link-profile/{student['id']}",
        headers=auth_headers(user),
    )
    assert link_resp.status_code == 200
    linked = link_resp.json()

    job = make_job()
    resp = client.post(
        "/api/applications",
        json={
            # intentionally wrong student id in payload; API should trust token
            "studentId": 999999,
            "jobPostingId": job["id"],
            "answers": [],
        },
        headers=auth_headers(linked["access_token"]),
    )
    assert resp.status_code == 201
    assert resp.json()["studentId"] == student["id"]

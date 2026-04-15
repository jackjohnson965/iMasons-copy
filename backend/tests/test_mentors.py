"""Tests for backend/routers/mentors.py — mentorship-only CRUD."""


def test_create_mentor_posting(client, make_employer):
    employer = make_employer()
    resp = client.post(
        "/api/mentors",
        json={
            "employerId": employer["id"],
            "title": "Career Mentorship",
            "description": "1:1 guidance",
            "location": "Remote",
            "industry": "tech",
            "status": "active",
            "customQuestions": [{"questionText": "Goals?"}],
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["jobType"] == "mentorship"
    assert body["isActive"] == 1
    assert len(body["customQuestions"]) == 1


def test_create_mentor_unknown_employer(client):
    resp = client.post(
        "/api/mentors",
        json={"employerId": 9999, "title": "X", "description": "Y"},
    )
    assert resp.status_code == 404


def test_create_mentor_invalid_status(client, make_employer):
    employer = make_employer()
    resp = client.post(
        "/api/mentors",
        json={
            "employerId": employer["id"],
            "title": "X",
            "description": "Y",
            "status": "banana",
        },
    )
    assert resp.status_code == 422


def test_list_mentors_excludes_jobs(client, make_job, make_mentor):
    make_job()  # full-time internship
    m = make_mentor()
    resp = client.get("/api/mentors")
    assert resp.status_code == 200
    data = resp.json()
    assert [p["id"] for p in data] == [m["id"]]
    assert all(p["jobType"] == "mentorship" for p in data)


def test_list_mentors_filters(client, make_mentor):
    make_mentor(location="Dallas", industry="tech", title="Python guidance")
    make_mentor(location="NYC", industry="finance", title="Banking help")
    assert len(client.get("/api/mentors", params={"location": "Dallas"}).json()) == 1
    assert len(client.get("/api/mentors", params={"industry": "tech"}).json()) == 1
    assert len(client.get("/api/mentors", params={"search": "Banking"}).json()) == 1


def test_get_mentor_posting(client, make_mentor):
    m = make_mentor()
    resp = client.get(f"/api/mentors/{m['id']}")
    assert resp.status_code == 200
    assert resp.json()["jobType"] == "mentorship"


def test_get_mentor_404_for_non_mentorship(client, make_job):
    j = make_job()
    # jobs aren't accessible via /api/mentors
    resp = client.get(f"/api/mentors/{j['id']}")
    assert resp.status_code == 404


def test_update_mentor_ignores_jobtype_change(client, make_mentor):
    m = make_mentor()
    resp = client.put(
        f"/api/mentors/{m['id']}",
        json={"jobType": "full-time", "title": "Updated"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["jobType"] == "mentorship"
    assert body["title"] == "Updated"


def test_update_mentor_status(client, make_mentor):
    m = make_mentor()
    resp = client.put(f"/api/mentors/{m['id']}", json={"status": "closed"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "closed"
    assert resp.json()["isActive"] == 0


def test_update_mentor_invalid_status(client, make_mentor):
    m = make_mentor()
    resp = client.put(f"/api/mentors/{m['id']}", json={"status": "banana"})
    assert resp.status_code == 422


def test_update_mentor_404(client):
    assert client.put("/api/mentors/9999", json={"title": "X"}).status_code == 404


def test_delete_mentor_soft_close(client, make_mentor):
    m = make_mentor()
    resp = client.delete(f"/api/mentors/{m['id']}")
    assert resp.status_code == 200
    got = client.get(f"/api/mentors/{m['id']}").json()
    assert got["status"] == "closed"


def test_delete_mentor_404(client):
    assert client.delete("/api/mentors/9999").status_code == 404

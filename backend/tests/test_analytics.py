"""Tests for backend/routers/analytics.py — events + aggregate summaries."""


def _event(client, event_type, target_id, viewer_role=""):
    return client.post(
        "/api/analytics/events",
        json={
            "eventType": event_type,
            "targetId": target_id,
            "viewerRole": viewer_role,
        },
    )


def test_record_event_profile_view(client):
    resp = _event(client, "profile_view", 1, "employer")
    assert resp.status_code == 201
    body = resp.json()
    assert body["eventType"] == "profile_view"
    assert body["targetId"] == 1
    assert body["viewerRole"] == "employer"


def test_record_event_posting_view(client):
    assert _event(client, "posting_view", 10).status_code == 201


def test_record_event_email_click(client):
    assert _event(client, "email_click", 10).status_code == 201


def test_record_event_invalid_type(client):
    resp = _event(client, "banana_click", 1)
    assert resp.status_code == 422


def test_student_analytics(client):
    _event(client, "profile_view", 1)
    _event(client, "profile_view", 1)
    _event(client, "profile_view", 2)  # different student
    _event(client, "posting_view", 1)  # different event type, same id

    resp = client.get("/api/analytics/student/1")
    assert resp.status_code == 200
    body = resp.json()
    assert body["totalViews"] == 2
    assert len(body["recentViews"]) == 2


def test_posting_analytics(client):
    _event(client, "posting_view", 5)
    _event(client, "posting_view", 5)
    _event(client, "posting_view", 5)
    resp = client.get("/api/analytics/posting/5")
    assert resp.status_code == 200
    assert resp.json()["totalViews"] == 3


def test_employer_analytics_aggregates(client, make_employer, make_job):
    employer = make_employer()
    job1 = make_job(employer=employer, title="Job A")
    job2 = make_job(employer=employer, title="Job B")

    _event(client, "posting_view", job1["id"])
    _event(client, "posting_view", job1["id"])
    _event(client, "email_click", job1["id"])
    _event(client, "posting_view", job2["id"])
    _event(client, "email_click", job2["id"])
    _event(client, "email_click", job2["id"])

    resp = client.get(f"/api/analytics/employer/{employer['id']}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["totalViews"] == 3
    assert body["totalEmailClicks"] == 3

    breakdown = {b["postingId"]: b for b in body["postingBreakdown"]}
    assert breakdown[job1["id"]]["views"] == 2
    assert breakdown[job1["id"]]["emailClicks"] == 1
    assert breakdown[job1["id"]]["title"] == "Job A"
    assert breakdown[job2["id"]]["views"] == 1
    assert breakdown[job2["id"]]["emailClicks"] == 2


def test_employer_analytics_empty(client, make_employer):
    employer = make_employer()
    resp = client.get(f"/api/analytics/employer/{employer['id']}")
    assert resp.status_code == 200
    body = resp.json()
    assert body == {"totalViews": 0, "totalEmailClicks": 0, "postingBreakdown": []}

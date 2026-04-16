"""Tests for backend/routers/employers.py — CRUD and filters."""


def test_create_employer(client):
    resp = client.post(
        "/api/employers",
        json={
            "companyName": "Acme",
            "contactEmail": "hr@acme.com",
            "industry": "tech",
            "location": "Dallas, TX",
            "description": "We make stuff",
            "websiteUrl": "https://acme.com",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["companyName"] == "Acme"
    assert body["id"] >= 1


def test_create_employer_duplicate_email(client, make_employer):
    e = make_employer()
    resp = client.post(
        "/api/employers",
        json={"companyName": "Other", "contactEmail": e["contactEmail"]},
    )
    assert resp.status_code == 409


def test_list_employers(client, make_employer):
    make_employer()
    make_employer()
    resp = client.get("/api/employers")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_list_employers_filter_industry(client, make_employer):
    make_employer(industry="tech")
    make_employer(industry="finance")
    resp = client.get("/api/employers", params={"industry": "tech"})
    assert [e["industry"] for e in resp.json()] == ["tech"]


def test_list_employers_search(client, make_employer):
    make_employer(companyName="Acme Industries", description="Widgets")
    make_employer(companyName="Globex", description="Things")
    resp = client.get("/api/employers", params={"search": "Acme"})
    assert [e["companyName"] for e in resp.json()] == ["Acme Industries"]


def test_get_employer(client, make_employer):
    e = make_employer()
    resp = client.get(f"/api/employers/{e['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == e["id"]


def test_get_employer_404(client):
    assert client.get("/api/employers/9999").status_code == 404


def test_update_employer(client, make_employer):
    e = make_employer()
    resp = client.put(
        f"/api/employers/{e['id']}",
        json={"description": "Updated description", "location": "Remote"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["description"] == "Updated description"
    assert body["location"] == "Remote"
    assert body["companyName"] == e["companyName"]


def test_update_employer_404(client):
    resp = client.put("/api/employers/9999", json={"description": "x"})
    assert resp.status_code == 404

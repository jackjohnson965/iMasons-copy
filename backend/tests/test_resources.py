"""Tests for backend/routers/resources.py — full CRUD."""


def test_create_resource(client):
    resp = client.post(
        "/api/resources",
        json={
            "title": "FastAPI Docs",
            "description": "Official docs",
            "url": "https://fastapi.tiangolo.com",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "FastAPI Docs"
    assert body["id"] >= 1


def test_list_resources(client):
    r1 = client.post(
        "/api/resources",
        json={"title": "First", "description": "d", "url": "https://a.example"},
    ).json()
    r2 = client.post(
        "/api/resources",
        json={"title": "Second", "description": "d", "url": "https://b.example"},
    ).json()
    resp = client.get("/api/resources")
    assert resp.status_code == 200
    # Both resources are returned. Server orders by createdAt DESC, but SQLite's
    # datetime('now') has second resolution so two inserts in the same second
    # can tie — don't assert exact ordering here.
    assert {r["id"] for r in resp.json()} == {r1["id"], r2["id"]}


def test_get_resource(client):
    created = client.post(
        "/api/resources",
        json={"title": "X", "description": "d", "url": "https://x.example"},
    ).json()
    resp = client.get(f"/api/resources/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_get_resource_404(client):
    assert client.get("/api/resources/9999").status_code == 404


def test_update_resource(client):
    created = client.post(
        "/api/resources",
        json={"title": "X", "description": "d", "url": "https://x.example"},
    ).json()
    resp = client.put(
        f"/api/resources/{created['id']}",
        json={"title": "New title"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["title"] == "New title"
    assert body["description"] == "d"  # unchanged


def test_update_resource_404(client):
    resp = client.put("/api/resources/9999", json={"title": "x"})
    assert resp.status_code == 404


def test_delete_resource(client):
    created = client.post(
        "/api/resources",
        json={"title": "X", "description": "d", "url": "https://x.example"},
    ).json()
    resp = client.delete(f"/api/resources/{created['id']}")
    assert resp.status_code == 200
    assert client.get(f"/api/resources/{created['id']}").status_code == 404


def test_delete_resource_404(client):
    assert client.delete("/api/resources/9999").status_code == 404

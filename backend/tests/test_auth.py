"""Tests for backend/routers/auth.py — register, login, link-profile, role gating."""
from jose import jwt

import auth as auth_module
from models import User


def test_register_student_success(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "alice@example.com",
            "password": "Password123",
            "role": "student",
            "imasonsIdentifier": "STU-1234",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["role"] == "student"
    assert body["userId"] >= 1
    assert body["linkedProfileId"] is None
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_register_employer_success(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "boss@co.com",
            "password": "Password123",
            "role": "employer",
            "imasonsIdentifier": "EMP-9999",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["role"] == "employer"


def test_register_admin_success(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "root@imasons.com",
            "password": "Password123",
            "role": "admin",
            "imasonsIdentifier": "ADM-0001",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["role"] == "admin"


def test_register_jwt_encodes_user_fields(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "jwt@example.com",
            "password": "Password123",
            "role": "student",
            "imasonsIdentifier": "STU-2000",
        },
    )
    token = resp.json()["access_token"]
    payload = jwt.decode(token, auth_module.SECRET_KEY, algorithms=[auth_module.ALGORITHM])
    assert payload["role"] == "student"
    assert payload["linkedProfileId"] is None
    assert payload["sub"] == str(resp.json()["userId"])


def test_register_invalid_role(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "x@y.com",
            "password": "Password123",
            "role": "wizard",
            "imasonsIdentifier": "WIZ-0001",
        },
    )
    assert resp.status_code == 422


def test_register_identifier_wrong_prefix(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "x@y.com",
            "password": "Password123",
            "role": "student",
            "imasonsIdentifier": "EMP-0001",
        },
    )
    assert resp.status_code == 422


def test_register_identifier_wrong_format(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "x@y.com",
            "password": "Password123",
            "role": "student",
            "imasonsIdentifier": "STU-12",
        },
    )
    assert resp.status_code == 422


def test_register_identifier_lowercased_is_normalized(client):
    # Identifier should be uppercased before validation and storage.
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "lower@example.com",
            "password": "Password123",
            "role": "student",
            "imasonsIdentifier": "stu-7777",
        },
    )
    assert resp.status_code == 201


def test_register_duplicate_email(client):
    body = {
        "email": "dup@example.com",
        "password": "Password123",
        "role": "student",
        "imasonsIdentifier": "STU-1234",
    }
    assert client.post("/api/auth/register", json=body).status_code == 201

    body2 = dict(body)
    body2["imasonsIdentifier"] = "STU-9999"
    resp = client.post("/api/auth/register", json=body2)
    assert resp.status_code == 409
    assert "email" in resp.json()["detail"].lower()


def test_register_duplicate_identifier(client):
    body = {
        "email": "a@example.com",
        "password": "Password123",
        "role": "student",
        "imasonsIdentifier": "STU-5555",
    }
    assert client.post("/api/auth/register", json=body).status_code == 201

    body2 = dict(body)
    body2["email"] = "b@example.com"
    resp = client.post("/api/auth/register", json=body2)
    assert resp.status_code == 409
    assert "identifier" in resp.json()["detail"].lower()


def test_register_hashes_password(client, db_session):
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "hash@example.com",
            "password": "SuperSecret123",
            "role": "student",
            "imasonsIdentifier": "STU-4242",
        },
    )
    assert resp.status_code == 201
    user = db_session.query(User).filter(User.email == "hash@example.com").first()
    assert user is not None
    # Password must be stored as a bcrypt hash, never in plaintext.
    assert user.hashedPassword != "SuperSecret123"
    assert user.hashedPassword.startswith("$2")


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


def test_login_success(client, make_user):
    u = make_user(role="student")
    resp = client.post(
        "/api/auth/login",
        json={"email": u["email"], "password": u["password"]},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["role"] == "student"
    assert body["userId"] == u["userId"]
    assert body["access_token"]


def test_login_wrong_password(client, make_user):
    u = make_user()
    resp = client.post(
        "/api/auth/login",
        json={"email": u["email"], "password": "WrongPassword"},
    )
    assert resp.status_code == 401


def test_login_unknown_email_returns_401_not_404(client):
    # Timing-safe: unknown email must return the same 401, not 404.
    resp = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "Password123"},
    )
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid email or password"


def test_login_error_detail_does_not_reveal_existence(client, make_user):
    make_user(email="real@example.com")
    r1 = client.post(
        "/api/auth/login",
        json={"email": "real@example.com", "password": "bad"},
    )
    r2 = client.post(
        "/api/auth/login",
        json={"email": "fake@example.com", "password": "bad"},
    )
    assert r1.status_code == r2.status_code == 401
    assert r1.json()["detail"] == r2.json()["detail"]


# ---------------------------------------------------------------------------
# Link profile
# ---------------------------------------------------------------------------


def test_link_profile_success(client, make_user, make_student, auth_headers):
    user = make_user(role="student")
    student = make_student()
    resp = client.post(
        f"/api/auth/link-profile/{student['id']}",
        headers=auth_headers(user),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["linkedProfileId"] == student["id"]
    # New token encodes the updated profile id.
    payload = jwt.decode(
        body["access_token"],
        auth_module.SECRET_KEY,
        algorithms=[auth_module.ALGORITHM],
    )
    assert payload["linkedProfileId"] == student["id"]


def test_link_profile_requires_auth(client):
    resp = client.post("/api/auth/link-profile/1")
    assert resp.status_code == 403  # HTTPBearer returns 403 when header missing


def test_link_profile_invalid_token(client):
    resp = client.post(
        "/api/auth/link-profile/1",
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Role gating (tested via admin endpoint as a probe)
# ---------------------------------------------------------------------------


def test_role_gated_endpoint_without_token(client):
    resp = client.get("/api/admin/students")
    assert resp.status_code == 403  # missing HTTPBearer credentials


def test_role_gated_endpoint_student_forbidden(client, make_user, auth_headers):
    user = make_user(role="student")
    resp = client.get("/api/admin/students", headers=auth_headers(user))
    assert resp.status_code == 403


def test_role_gated_endpoint_admin_allowed(client, make_user, auth_headers):
    admin = make_user(role="admin")
    resp = client.get("/api/admin/students", headers=auth_headers(admin))
    assert resp.status_code == 200

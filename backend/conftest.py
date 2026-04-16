"""
Pytest configuration and shared fixtures for the iMasons backend test suite.

Strategy:
- One in-memory SQLite engine per test (StaticPool so the TestClient and the
  app dependency share the same connection).
- get_db is overridden so every request in a test hits the test engine.
- File upload directories are monkeypatched to a per-test tmp_path so real
  uploads/ never gets written to.
- bcrypt rounds are reduced to 4 globally to keep auth tests fast.
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pytest
from fastapi.testclient import TestClient
from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Patch the password hashing context BEFORE main/app is imported.
# auth.hash_password / verify_password resolve `pwd_context` from module
# globals at call time, so replacing the attribute is sufficient.
import auth as auth_module

auth_module.pwd_context = CryptContext(
    schemes=["bcrypt"], bcrypt__rounds=4, deprecated="auto"
)

from database import Base, get_db  # noqa: E402
from main import app  # noqa: E402
from routers import students as students_router  # noqa: E402


# ---------------------------------------------------------------------------
# Database + client fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def db_engine(tmp_path, monkeypatch):
    # Redirect upload directories to a per-test temp path so uploaded files
    # never leak into the real backend/uploads/ directory.
    monkeypatch.setattr(students_router, "UPLOAD_ROOT", tmp_path / "resumes")
    monkeypatch.setattr(
        students_router, "PROFILE_PHOTO_UPLOAD_ROOT", tmp_path / "profile_pictures"
    )

    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    try:
        yield engine
    finally:
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture
def TestingSessionLocal(db_engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=db_engine)


@pytest.fixture
def db_session(TestingSessionLocal):
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(TestingSessionLocal):
    def _override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Factory fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def make_user(client):
    """Register a user via the API and return {userId, role, email, password, identifier, token, linkedProfileId}."""
    counter = {"n": 0}

    def _make(role="student", password="Password123", email=None, identifier=None):
        counter["n"] += 1
        i = counter["n"]
        if email is None:
            email = f"{role}{i}@example.com"
        if identifier is None:
            prefix = {"student": "STU", "employer": "EMP", "admin": "ADM"}[role]
            identifier = f"{prefix}-{1000 + i:04d}"
        resp = client.post(
            "/api/auth/register",
            json={
                "email": email,
                "password": password,
                "role": role,
                "imasonsIdentifier": identifier,
            },
        )
        assert resp.status_code == 201, resp.text
        data = resp.json()
        return {
            "userId": data["userId"],
            "role": data["role"],
            "email": email,
            "password": password,
            "identifier": identifier,
            "token": data["access_token"],
            "linkedProfileId": data["linkedProfileId"],
        }

    return _make


@pytest.fixture
def auth_headers():
    def _headers(token_or_user):
        token = (
            token_or_user["token"]
            if isinstance(token_or_user, dict)
            else token_or_user
        )
        return {"Authorization": f"Bearer {token}"}

    return _headers


@pytest.fixture
def make_student(client):
    counter = {"n": 0}

    def _make(**overrides):
        counter["n"] += 1
        i = counter["n"]
        payload = {
            "firstName": f"First{i}",
            "lastName": f"Last{i}",
            "email": f"student_profile{i}@example.com",
            "bio": "",
            "location": "",
            "skills": "",
        }
        payload.update(overrides)
        resp = client.post("/api/students", json=payload)
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make


@pytest.fixture
def make_employer(client):
    counter = {"n": 0}

    def _make(**overrides):
        counter["n"] += 1
        i = counter["n"]
        payload = {
            "companyName": f"Company {i}",
            "contactEmail": f"employer_profile{i}@example.com",
            "industry": "",
            "location": "",
            "description": "",
            "websiteUrl": "",
        }
        payload.update(overrides)
        resp = client.post("/api/employers", json=payload)
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make


@pytest.fixture
def make_job(client, make_employer):
    def _make(employer=None, **overrides):
        if employer is None:
            employer = make_employer()
        payload = {
            "employerId": employer["id"],
            "title": "Software Engineer Intern",
            "description": "Write great code.",
            "location": "Dallas, TX",
            "jobType": "internship",
            "industry": "tech",
            "status": "active",
            "customQuestions": [],
        }
        payload.update(overrides)
        resp = client.post("/api/job-postings", json=payload)
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make


@pytest.fixture
def make_application(client, make_student, make_job):
    def _make(student=None, job=None, answers=None):
        if student is None:
            student = make_student()
        if job is None:
            job = make_job(
                customQuestions=[
                    {"questionText": "Why are you interested?", "questionOrder": 0},
                    {"questionText": "What is your availability?", "questionOrder": 1},
                ],
            )
        if answers is None:
            answers = [
                {"questionId": q["id"], "answerText": f"Answer to Q{i+1}"}
                for i, q in enumerate(job.get("customQuestions", []))
            ]
        resp = client.post(
            "/api/applications",
            json={
                "studentId": student["id"],
                "jobPostingId": job["id"],
                "answers": answers,
            },
        )
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make


@pytest.fixture
def make_mentor(client, make_employer):
    def _make(employer=None, **overrides):
        if employer is None:
            employer = make_employer()
        payload = {
            "employerId": employer["id"],
            "title": "Career Mentorship",
            "description": "Guidance and support",
            "location": "Remote",
            "industry": "tech",
            "status": "active",
            "customQuestions": [],
        }
        payload.update(overrides)
        resp = client.post("/api/mentors", json=payload)
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make


# ---------------------------------------------------------------------------
# File fixtures for upload tests
# ---------------------------------------------------------------------------


@pytest.fixture
def pdf_bytes():
    return b"%PDF-1.4\n" + b"fake pdf body line\n" * 20 + b"%%EOF\n"


@pytest.fixture
def not_pdf_bytes():
    return b"this is definitely not a pdf at all"


@pytest.fixture
def oversize_pdf_bytes():
    return b"%PDF-1.4\n" + b"A" * (6 * 1024 * 1024)


@pytest.fixture
def jpeg_bytes():
    return b"\xff\xd8\xff\xe0" + b"\x00" * 512


@pytest.fixture
def png_bytes():
    return b"\x89PNG\r\n\x1a\n" + b"\x00" * 512


@pytest.fixture
def webp_bytes():
    return b"RIFF" + b"\x00\x00\x01\x00" + b"WEBP" + b"\x00" * 512

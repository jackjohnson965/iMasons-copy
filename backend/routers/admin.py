"""
routers/admin.py — Admin-only moderation and management endpoints.

All routes require role='admin', enforced via the require_role dependency.
These endpoints give admins the ability to moderate content and manage users
without permanently deleting any data (soft actions only).

GET  /api/admin/students                   — List all students including hidden ones
PUT  /api/admin/students/{id}/status       — Set student status: active | hidden
GET  /api/admin/job-postings               — List all postings (all statuses)
PUT  /api/admin/job-postings/{id}/status   — Set posting status: active | closed | archived
GET  /api/admin/users                      — List all user accounts (no passwords)
POST /api/admin/users/{id}/password-reset  — Generate a temporary password for a user
"""
import secrets
import string

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Student, JobPosting, User
from schemas import (
    StudentResponse,
    JobPostingListResponse,
    StudentStatusUpdate,
    JobPostingStatusUpdate,
    PasswordResetResponse,
)
from auth import require_role, hash_password

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Shorthand dependency — all routes below require the 'admin' role
admin_required = Depends(require_role("admin"))


@router.get("/students", response_model=list[StudentResponse], dependencies=[admin_required])
def admin_list_students(db: Session = Depends(get_db)):
    """
    List ALL students, including those with isActive=0 (hidden/inactive).
    The standard /api/students endpoint may filter these out by default.
    """
    return db.query(Student).order_by(Student.createdAt.desc()).all()


@router.put("/students/{student_id}/status", response_model=StudentResponse, dependencies=[admin_required])
def admin_set_student_status(
    student_id: int,
    body: StudentStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Set a student's visibility status.
    body.status: 'active' → sets isActive=1 (visible in searches)
                 'hidden'  → sets isActive=0 (hidden from searches)
    """
    if body.status not in ("active", "hidden"):
        raise HTTPException(status_code=422, detail="status must be 'active' or 'hidden'")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.isActive = 1 if body.status == "active" else 0
    db.commit()
    db.refresh(student)
    return student


@router.get("/job-postings", response_model=list[JobPostingListResponse], dependencies=[admin_required])
def admin_list_job_postings(db: Session = Depends(get_db)):
    """
    List ALL job postings regardless of status (active, closed, archived).
    """
    return db.query(JobPosting).order_by(JobPosting.createdAt.desc()).all()


@router.put("/job-postings/{posting_id}/status", response_model=JobPostingListResponse, dependencies=[admin_required])
def admin_set_posting_status(
    posting_id: int,
    body: JobPostingStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Set a job posting's status: active | closed | archived.
    Also updates the legacy isActive field for backward compatibility.
    """
    if body.status not in ("active", "closed", "archived"):
        raise HTTPException(
            status_code=422,
            detail="status must be 'active', 'closed', or 'archived'",
        )

    posting = db.query(JobPosting).filter(JobPosting.id == posting_id).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")

    posting.status = body.status
    # Keep legacy field in sync so older code paths still work
    posting.isActive = 1 if body.status == "active" else 0
    db.commit()
    db.refresh(posting)
    return posting


@router.get("/users", dependencies=[admin_required])
def admin_list_users(db: Session = Depends(get_db)):
    """
    List all User accounts (without passwords) for admin management.
    Useful for looking up user IDs before triggering a password reset.
    """
    users = db.query(User).order_by(User.createdAt.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "imasonsIdentifier": u.imasonsIdentifier,
            "linkedProfileId": u.linkedProfileId,
            "createdAt": u.createdAt,
        }
        for u in users
    ]


@router.post("/users/{user_id}/password-reset", response_model=PasswordResetResponse, dependencies=[admin_required])
def admin_password_reset(user_id: int, db: Session = Depends(get_db)):
    """
    Generate a temporary 12-character random password for a user.

    The temp password is immediately hashed and stored, replacing the
    user's current password. The plaintext temp password is returned to
    the admin to share with the user out-of-band (e.g., email, phone).

    NOTE: In a production system with email configured, this would send
    a secure reset link instead. For MVP without email infrastructure,
    the admin copies and communicates the temp password manually.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate a cryptographically secure random temp password
    alphabet = string.ascii_letters + string.digits + "!@#$"
    temp_password = "".join(secrets.choice(alphabet) for _ in range(12))

    user.hashedPassword = hash_password(temp_password)
    db.commit()

    return PasswordResetResponse(
        tempPassword=temp_password,
        message=f"Temporary password set for {user.email}. Share securely — it will not be shown again.",
    )

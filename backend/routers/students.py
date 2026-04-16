import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Student
from schemas import StudentCreate, StudentUpdate, StudentResponse
from auth import get_current_user

router = APIRouter(prefix="/api/students", tags=["students"])

UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads" / "resumes"
MAX_RESUME_BYTES = 5 * 1024 * 1024  # 5 MB
PROFILE_PHOTO_UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads" / "profile_pictures"
MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024  # 5 MB
PROFILE_PHOTO_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
PROFILE_PHOTO_MEDIA_BY_EXT = {
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def _resume_path(student_id: int) -> Path:
    return UPLOAD_ROOT / f"{student_id}.pdf"


def _ensure_upload_dir() -> None:
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def _profile_photo_path(student_id: int, ext: str) -> Path:
    return PROFILE_PHOTO_UPLOAD_ROOT / f"{student_id}{ext}"


def _find_profile_photo_path(student_id: int) -> Optional[Path]:
    for ext in PROFILE_PHOTO_MEDIA_BY_EXT:
        candidate = _profile_photo_path(student_id, ext)
        if candidate.exists():
            return candidate
    return None


def _ensure_profile_photo_upload_dir() -> None:
    PROFILE_PHOTO_UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def _is_valid_profile_photo_header(content_type: str, header: bytes) -> bool:
    if content_type == "image/jpeg":
        return header.startswith(b"\xff\xd8\xff")
    if content_type == "image/png":
        return header.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp":
        return len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP"
    return False


async def _read_first_bytes(file: UploadFile, n: int) -> bytes:
    # UploadFile uses SpooledTemporaryFile; safe to seek back after peeking.
    pos = file.file.tell()
    try:
        chunk = await file.read(n)
        return chunk
    finally:
        await file.seek(pos)


def _authorize_student_owner_or_admin(current_user, student_id: int) -> None:
    if current_user.role == "admin":
        return
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if current_user.linkedProfileId != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def _authorize_student_owner(current_user, student_id: int) -> None:
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if current_user.linkedProfileId != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


@router.post("/{student_id}/resume", response_model=StudentResponse)
async def upload_resume(
    student_id: int,
    resume: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload/replace a student's resume PDF.
    - PDF-only (content-type + magic bytes)
    - size-limited
    - stored on local disk
    - updates Student.resumeLink to the authenticated download endpoint
    """
    _authorize_student_owner_or_admin(current_user, student_id)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if not resume or not resume.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing resume file")

    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF resumes are allowed")

    header = await _read_first_bytes(resume, 5)
    if header != b"%PDF-":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PDF file")

    _ensure_upload_dir()
    target_path = _resume_path(student_id)
    tmp_path = UPLOAD_ROOT / f"{student_id}.{uuid.uuid4().hex}.uploading"

    bytes_written = 0
    try:
        with open(tmp_path, "wb") as out:
            while True:
                chunk = await resume.read(1024 * 1024)
                if not chunk:
                    break
                bytes_written += len(chunk)
                if bytes_written > MAX_RESUME_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Resume too large (max {MAX_RESUME_BYTES // (1024 * 1024)} MB)",
                    )
                out.write(chunk)

        # Atomic replace on same filesystem
        os.replace(tmp_path, target_path)

        student.resumeLink = f"/api/students/{student_id}/resume/download"
        db.commit()
        db.refresh(student)
        return student
    finally:
        # Clean up tmp file if an exception happened before replace
        try:
            if tmp_path.exists():
                tmp_path.unlink()
        except Exception:
            pass


@router.post("/{student_id}/profile-photo", response_model=StudentResponse)
async def upload_profile_photo(
    student_id: int,
    profile_photo: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload/replace a student's profile photo.
    - image-only (jpeg/png/webp)
    - size-limited
    - stored on local disk
    - updates Student.profileImageLink to the authenticated download endpoint
    """
    _authorize_student_owner(current_user, student_id)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if not profile_photo or not profile_photo.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing profile photo file")

    if profile_photo.content_type not in PROFILE_PHOTO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP profile photos are allowed",
        )

    header = await _read_first_bytes(profile_photo, 16)
    if not _is_valid_profile_photo_header(profile_photo.content_type, header):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file")

    _ensure_profile_photo_upload_dir()
    ext = PROFILE_PHOTO_TYPES[profile_photo.content_type]
    target_path = _profile_photo_path(student_id, ext)
    tmp_path = PROFILE_PHOTO_UPLOAD_ROOT / f"{student_id}.{uuid.uuid4().hex}.uploading"

    bytes_written = 0
    try:
        with open(tmp_path, "wb") as out:
            while True:
                chunk = await profile_photo.read(1024 * 1024)
                if not chunk:
                    break
                bytes_written += len(chunk)
                if bytes_written > MAX_PROFILE_PHOTO_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Profile photo too large (max {MAX_PROFILE_PHOTO_BYTES // (1024 * 1024)} MB)",
                    )
                out.write(chunk)

        for candidate_ext in PROFILE_PHOTO_MEDIA_BY_EXT:
            candidate = _profile_photo_path(student_id, candidate_ext)
            if candidate != target_path and candidate.exists():
                candidate.unlink()

        # Atomic replace on same filesystem
        os.replace(tmp_path, target_path)

        student.profileImageLink = f"/api/students/{student_id}/profile-photo/download"
        db.commit()
        db.refresh(student)
        return student
    finally:
        # Clean up tmp file if an exception happened before replace
        try:
            if tmp_path.exists():
                tmp_path.unlink()
        except Exception:
            pass


@router.get("/{student_id}/profile-photo/download")
def download_profile_photo(
    student_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Authenticated-only profile photo download.
    Any authenticated user can download; upload is restricted to the owner.
    """
    # Auth enforced by dependency; permission is "authenticated only"
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    path = _find_profile_photo_path(student_id)
    if not path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile photo not found")

    media_type = PROFILE_PHOTO_MEDIA_BY_EXT.get(path.suffix.lower(), "application/octet-stream")
    filename = f"{student.firstName}_{student.lastName}_ProfilePhoto{path.suffix}".replace(" ", "_")
    return FileResponse(
        path=str(path),
        media_type=media_type,
        filename=filename,
    )


@router.get("/{student_id}/resume/download")
def download_resume(
    student_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Authenticated-only resume download.
    Any authenticated user can download; upload is restricted to the owner/admin.
    """
    # Auth enforced by dependency; permission is "authenticated only"
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    path = _resume_path(student_id)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    filename = f"{student.firstName}_{student.lastName}_Resume.pdf".replace(" ", "_")
    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=filename,
    )


@router.post("", response_model=StudentResponse, status_code=201)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student profile."""
    existing = db.query(Student).filter(Student.email == student.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="A student with this email already exists")
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@router.get("", response_model=list[StudentResponse])
def list_students(
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    skills: Optional[str] = Query(None),
    isActive: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """List all students with optional filters."""
    query = db.query(Student)
    if isActive is not None:
        query = query.filter(Student.isActive == isActive)
    if location:
        query = query.filter(Student.location.ilike(f"%{location}%"))
    if skills:
        query = query.filter(Student.skills.ilike(f"%{skills}%"))
    if search:
        query = query.filter(
            (Student.firstName.ilike(f"%{search}%"))
            | (Student.lastName.ilike(f"%{search}%"))
            | (Student.bio.ilike(f"%{search}%"))
            | (Student.skills.ilike(f"%{search}%"))
        )
    return query.all()


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a single student profile by ID."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, updates: StudentUpdate, db: Session = Depends(get_db)):
    """Update a student profile."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}")
def deactivate_student(student_id: int, db: Session = Depends(get_db)):
    """Deactivate a student profile (soft delete)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.isActive = 0
    db.commit()
    return {"message": "Student deactivated"}

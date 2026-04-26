from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from database import get_db
from auth import get_optional_current_user
from models import Application, ApplicationAnswer, Student, JobPosting, User
from schemas import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationDetailResponse,
)

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.post("", response_model=ApplicationResponse, status_code=201)
def create_application(
    body: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    resolved_student_id = body.studentId
    if current_user and current_user.role == "student":
        # If the token is from a student account, trust the linked profile id.
        resolved_student_id = current_user.linkedProfileId

    if resolved_student_id is None:
        raise HTTPException(
            status_code=422,
            detail="studentId is required (or authenticate as a linked student account)",
        )

    student = db.query(Student).filter(Student.id == resolved_student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    posting = db.query(JobPosting).filter(JobPosting.id == body.jobPostingId).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")

    existing = (
        db.query(Application)
        .filter(Application.studentId == resolved_student_id, Application.jobPostingId == body.jobPostingId)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already applied to this posting")

    application = Application(
        studentId=resolved_student_id,
        jobPostingId=body.jobPostingId,
    )
    db.add(application)
    db.flush()

    for a in body.answers:
        db.add(ApplicationAnswer(
            applicationId=application.id,
            questionId=a.questionId,
            answerText=a.answerText,
        ))

    db.commit()
    db.refresh(application)
    return application


@router.get("", response_model=list[ApplicationDetailResponse])
def list_applications(
    jobPostingId: Optional[int] = Query(None),
    studentId: Optional[int] = Query(None),
    employerId: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Application)
        .options(
            joinedload(Application.answers).joinedload(ApplicationAnswer.question),
            joinedload(Application.student),
        )
    )

    if jobPostingId is not None:
        query = query.filter(Application.jobPostingId == jobPostingId)
    if studentId is not None:
        query = query.filter(Application.studentId == studentId)
    if employerId is not None:
        query = query.join(JobPosting).filter(JobPosting.employerId == employerId)

    return query.order_by(Application.createdAt.desc()).all()


@router.get("/{application_id}", response_model=ApplicationDetailResponse)
def get_application(application_id: int, db: Session = Depends(get_db)):
    application = (
        db.query(Application)
        .options(
            joinedload(Application.answers).joinedload(ApplicationAnswer.question),
            joinedload(Application.student),
        )
        .filter(Application.id == application_id)
        .first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.put("/{application_id}/status")
def update_application_status(application_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if status not in ("submitted", "reviewed", "accepted", "rejected"):
        raise HTTPException(status_code=422, detail="Invalid status")
    application.status = status
    db.commit()
    return {"message": f"Application status updated to {status}"}

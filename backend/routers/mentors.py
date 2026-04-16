from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from database import get_db
from models import JobPosting, CustomQuestion, Employer
from schemas import (
    JobPostingCreate,  # still used for update responses/filters
    JobPostingUpdate,
    JobPostingResponse,
    JobPostingListResponse,
    MentorPostingCreate,
)

router = APIRouter(prefix="/api/mentors", tags=["mentorships"])


@router.post("", response_model=JobPostingResponse, status_code=201)
def create_mentor_posting(posting: MentorPostingCreate, db: Session = Depends(get_db)):
    """Create a mentorship posting.

    Inputs mirror normal job creation but omit the `jobType` field since it is
    implicitly `mentorship` for every record.
    """
    # ensure the employer exists
    employer = db.query(Employer).filter(Employer.id == posting.employerId).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")

    # validate status
    if posting.status not in ("active", "closed", "archived"):
        raise HTTPException(status_code=422, detail="status must be 'active', 'closed', or 'archived'")

    db_posting = JobPosting(
        employerId=posting.employerId,
        title=posting.title,
        description=posting.description,
        location=posting.location,
        jobType="mentorship",
        industry=posting.industry,
        applicationUrl=posting.applicationUrl,
        status=posting.status,
        isActive=1 if posting.status == "active" else 0,
    )
    db.add(db_posting)
    db.flush()

    for i, q in enumerate(posting.customQuestions):
        db_question = CustomQuestion(
            jobPostingId=db_posting.id,
            questionText=q.questionText,
            questionOrder=q.questionOrder if q.questionOrder else i,
        )
        db.add(db_question)

    db.commit()
    db.refresh(db_posting)
    return db_posting


@router.get("", response_model=list[JobPostingListResponse])
def list_mentor_postings(
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    isActive: Optional[int] = Query(None),
    employerId: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List mentorship postings only. All filtering is the same as `/job-postings` but
    `jobType` is implicitly set to `mentorship`.
    """
    query = db.query(JobPosting).filter(JobPosting.jobType == "mentorship")

    if status is not None:
        query = query.filter(JobPosting.status == status)
    elif isActive is not None:
        query = query.filter(JobPosting.isActive == isActive)

    if employerId is not None:
        query = query.filter(JobPosting.employerId == employerId)
    if location:
        query = query.filter(JobPosting.location.ilike(f"%{location}%"))
    if industry:
        query = query.filter(JobPosting.industry.ilike(f"%{industry}%"))
    if search:
        query = query.filter(
            (JobPosting.title.ilike(f"%{search}%"))
            | (JobPosting.description.ilike(f"%{search}%"))
        )
    return query.order_by(JobPosting.createdAt.desc()).all()


@router.get("/{posting_id}", response_model=JobPostingResponse)
def get_mentor_posting(posting_id: int, db: Session = Depends(get_db)):
    posting = (
        db.query(JobPosting)
        .options(joinedload(JobPosting.customQuestions))
        .filter(JobPosting.id == posting_id, JobPosting.jobType == "mentorship")
        .first()
    )
    if not posting:
        raise HTTPException(status_code=404, detail="Mentorship posting not found")
    return posting


@router.put("/{posting_id}", response_model=JobPostingResponse)
def update_mentor_posting(posting_id: int, updates: JobPostingUpdate, db: Session = Depends(get_db)):
    posting = db.query(JobPosting).filter(JobPosting.id == posting_id, JobPosting.jobType == "mentorship").first()
    if not posting:
        raise HTTPException(status_code=404, detail="Mentorship posting not found")

    update_data = updates.model_dump(exclude_unset=True)

    # prevent changing jobType, always mentorship
    if "jobType" in update_data:
        update_data.pop("jobType")

    if "status" in update_data:
        new_status = update_data["status"]
        if new_status not in ("active", "closed", "archived"):
            raise HTTPException(status_code=422, detail="status must be 'active', 'closed', or 'archived'")
        update_data["isActive"] = 1 if new_status == "active" else 0

    for key, value in update_data.items():
        setattr(posting, key, value)

    db.commit()
    db.refresh(posting)
    return posting


@router.delete("/{posting_id}")
def deactivate_mentor_posting(posting_id: int, db: Session = Depends(get_db)):
    posting = db.query(JobPosting).filter(JobPosting.id == posting_id, JobPosting.jobType == "mentorship").first()
    if not posting:
        raise HTTPException(status_code=404, detail="Mentorship posting not found")
    posting.status = "closed"
    posting.isActive = 0
    db.commit()
    return {"message": "Mentorship posting closed"}

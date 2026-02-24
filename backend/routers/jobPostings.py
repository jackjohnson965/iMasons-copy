from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from database import get_db
from models import JobPosting, CustomQuestion, Employer
from schemas import JobPostingCreate, JobPostingUpdate, JobPostingResponse, JobPostingListResponse

router = APIRouter(prefix="/api/job-postings", tags=["job-postings"])


@router.post("", response_model=JobPostingResponse, status_code=201)
def create_job_posting(posting: JobPostingCreate, db: Session = Depends(get_db)):
    """Create a job posting with optional custom questions."""
    employer = db.query(Employer).filter(Employer.id == posting.employerId).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")

    db_posting = JobPosting(
        employerId=posting.employerId,
        title=posting.title,
        description=posting.description,
        location=posting.location,
        jobType=posting.jobType,
        industry=posting.industry,
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
def list_job_postings(
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    jobType: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    isActive: Optional[int] = Query(None),
    employerId: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """List job postings with optional search and filters."""
    query = db.query(JobPosting)
    if isActive is not None:
        query = query.filter(JobPosting.isActive == isActive)
    if employerId is not None:
        query = query.filter(JobPosting.employerId == employerId)
    if location:
        query = query.filter(JobPosting.location.ilike(f"%{location}%"))
    if jobType:
        query = query.filter(JobPosting.jobType == jobType)
    if industry:
        query = query.filter(JobPosting.industry.ilike(f"%{industry}%"))
    if search:
        query = query.filter(
            (JobPosting.title.ilike(f"%{search}%"))
            | (JobPosting.description.ilike(f"%{search}%"))
        )
    return query.order_by(JobPosting.createdAt.desc()).all()


@router.get("/{posting_id}", response_model=JobPostingResponse)
def get_job_posting(posting_id: int, db: Session = Depends(get_db)):
    """Get a single job posting with its custom questions."""
    posting = (
        db.query(JobPosting)
        .options(joinedload(JobPosting.customQuestions))
        .filter(JobPosting.id == posting_id)
        .first()
    )
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return posting


@router.put("/{posting_id}", response_model=JobPostingResponse)
def update_job_posting(posting_id: int, updates: JobPostingUpdate, db: Session = Depends(get_db)):
    """Update a job posting."""
    posting = db.query(JobPosting).filter(JobPosting.id == posting_id).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(posting, key, value)
    db.commit()
    db.refresh(posting)
    return posting


@router.delete("/{posting_id}")
def deactivate_job_posting(posting_id: int, db: Session = Depends(get_db)):
    """Deactivate a job posting (soft delete)."""
    posting = db.query(JobPosting).filter(JobPosting.id == posting_id).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    posting.isActive = 0
    db.commit()
    return {"message": "Job posting deactivated"}

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

    # Validate status value
    if posting.status not in ("active", "closed", "archived"):
        raise HTTPException(status_code=422, detail="status must be 'active', 'closed', or 'archived'")

    db_posting = JobPosting(
        employerId=posting.employerId,
        title=posting.title,
        description=posting.description,
        location=posting.location,
        jobType=posting.jobType,
        industry=posting.industry,
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
def list_job_postings(
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    jobType: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    status: Optional[str] = Query(None),      # replaces isActive; values: active | closed | archived
    isActive: Optional[int] = Query(None),     # legacy support — prefer `status`
    employerId: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List job postings with optional search and filters.
    Use `status` parameter (active/closed/archived) for filtering.
    Legacy `isActive` parameter is still supported for backward compatibility.
    """
    query = db.query(JobPosting)

    # Prefer status filter over legacy isActive
    if status is not None:
        query = query.filter(JobPosting.status == status)
    elif isActive is not None:
        # Convert legacy isActive to status filter
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
    """Update a job posting. When updating status, isActive is kept in sync automatically."""
    posting = db.query(JobPosting).filter(JobPosting.id == posting_id).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")

    update_data = updates.model_dump(exclude_unset=True)

    # When status is updated, sync the legacy isActive field
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
def deactivate_job_posting(posting_id: int, db: Session = Depends(get_db)):
    """Close a job posting (soft delete — sets status to 'closed')."""
    posting = db.query(JobPosting).filter(JobPosting.id == posting_id).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    posting.status = "closed"
    posting.isActive = 0  # keep legacy field in sync
    db.commit()
    return {"message": "Job posting closed"}

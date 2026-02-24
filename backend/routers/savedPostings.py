from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import SavedPosting, Student, JobPosting
from schemas import SavedPostingCreate, SavedPostingResponse, SavedPostingWithJobResponse

router = APIRouter(prefix="/api/saved-postings", tags=["saved-postings"])


@router.post("", response_model=SavedPostingResponse, status_code=201)
def save_posting(saved: SavedPostingCreate, db: Session = Depends(get_db)):
    """Save a job posting for a student."""
    student = db.query(Student).filter(Student.id == saved.studentId).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    posting = db.query(JobPosting).filter(JobPosting.id == saved.jobPostingId).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")

    existing = (
        db.query(SavedPosting)
        .filter(SavedPosting.studentId == saved.studentId, SavedPosting.jobPostingId == saved.jobPostingId)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already saved")

    db_saved = SavedPosting(**saved.model_dump())
    db.add(db_saved)
    db.commit()
    db.refresh(db_saved)
    return db_saved


@router.get("", response_model=list[SavedPostingWithJobResponse])
def get_saved_postings(studentId: int = Query(...), db: Session = Depends(get_db)):
    """Get all saved postings for a student, including job details."""
    return (
        db.query(SavedPosting)
        .options(joinedload(SavedPosting.jobPosting))
        .filter(SavedPosting.studentId == studentId)
        .all()
    )


@router.delete("/{saved_id}")
def unsave_posting(saved_id: int, db: Session = Depends(get_db)):
    """Remove a saved posting."""
    saved = db.query(SavedPosting).filter(SavedPosting.id == saved_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved posting not found")
    db.delete(saved)
    db.commit()
    return {"message": "Posting unsaved"}

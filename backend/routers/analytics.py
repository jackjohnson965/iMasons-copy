from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import AnalyticsEvent, JobPosting
from schemas import AnalyticsEventCreate, AnalyticsEventResponse, AnalyticsSummary, EmployerAnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post("/events", response_model=AnalyticsEventResponse, status_code=201)
def record_event(event: AnalyticsEventCreate, db: Session = Depends(get_db)):
    """Record a view event (profile_view or posting_view)."""
    db_event = AnalyticsEvent(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.get("/student/{student_id}", response_model=AnalyticsSummary)
def get_student_analytics(student_id: int, db: Session = Depends(get_db)):
    """Get view analytics for a student profile."""
    events = (
        db.query(AnalyticsEvent)
        .filter(AnalyticsEvent.eventType == "profile_view", AnalyticsEvent.targetId == student_id)
        .order_by(AnalyticsEvent.createdAt.desc())
        .all()
    )
    return AnalyticsSummary(totalViews=len(events), recentViews=events[:10])


@router.get("/posting/{posting_id}", response_model=AnalyticsSummary)
def get_posting_analytics(posting_id: int, db: Session = Depends(get_db)):
    """Get view analytics for a job posting."""
    events = (
        db.query(AnalyticsEvent)
        .filter(AnalyticsEvent.eventType == "posting_view", AnalyticsEvent.targetId == posting_id)
        .order_by(AnalyticsEvent.createdAt.desc())
        .all()
    )
    return AnalyticsSummary(totalViews=len(events), recentViews=events[:10])


@router.get("/employer/{employer_id}", response_model=EmployerAnalyticsSummary)
def get_employer_analytics(employer_id: int, db: Session = Depends(get_db)):
    """Get aggregate analytics for all of an employer's postings."""
    posting_ids = (
        db.query(JobPosting.id).filter(JobPosting.employerId == employer_id).all()
    )
    posting_ids = [p[0] for p in posting_ids]

    if not posting_ids:
        return EmployerAnalyticsSummary(totalViews=0, postingBreakdown=[])

    total = (
        db.query(func.count(AnalyticsEvent.id))
        .filter(
            AnalyticsEvent.eventType == "posting_view",
            AnalyticsEvent.targetId.in_(posting_ids),
        )
        .scalar()
    )

    breakdown = []
    for pid in posting_ids:
        posting = db.query(JobPosting).filter(JobPosting.id == pid).first()
        count = (
            db.query(func.count(AnalyticsEvent.id))
            .filter(AnalyticsEvent.eventType == "posting_view", AnalyticsEvent.targetId == pid)
            .scalar()
        )
        breakdown.append({"postingId": pid, "title": posting.title, "views": count})

    return EmployerAnalyticsSummary(totalViews=total, postingBreakdown=breakdown)

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Employer
from schemas import EmployerCreate, EmployerUpdate, EmployerResponse

router = APIRouter(prefix="/api/employers", tags=["employers"])


@router.post("", response_model=EmployerResponse, status_code=201)
def create_employer(employer: EmployerCreate, db: Session = Depends(get_db)):
    """Create a new employer profile."""
    existing = db.query(Employer).filter(Employer.contactEmail == employer.contactEmail).first()
    if existing:
        raise HTTPException(status_code=409, detail="An employer with this email already exists")
    db_employer = Employer(**employer.model_dump())
    db.add(db_employer)
    db.commit()
    db.refresh(db_employer)
    return db_employer


@router.get("", response_model=list[EmployerResponse])
def list_employers(
    search: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List all employers with optional filters."""
    query = db.query(Employer)
    if industry:
        query = query.filter(Employer.industry.ilike(f"%{industry}%"))
    if search:
        query = query.filter(
            (Employer.companyName.ilike(f"%{search}%"))
            | (Employer.description.ilike(f"%{search}%"))
        )
    return query.all()


@router.get("/{employer_id}", response_model=EmployerResponse)
def get_employer(employer_id: int, db: Session = Depends(get_db)):
    """Get a single employer by ID."""
    employer = db.query(Employer).filter(Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    return employer


@router.put("/{employer_id}", response_model=EmployerResponse)
def update_employer(employer_id: int, updates: EmployerUpdate, db: Session = Depends(get_db)):
    """Update an employer profile."""
    employer = db.query(Employer).filter(Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(employer, key, value)
    db.commit()
    db.refresh(employer)
    return employer

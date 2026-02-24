from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Student
from schemas import StudentCreate, StudentUpdate, StudentResponse

router = APIRouter(prefix="/api/students", tags=["students"])


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

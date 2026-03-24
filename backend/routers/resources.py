from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Resource
from schemas import ResourceCreate, ResourceUpdate, ResourceResponse

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.post("", response_model=ResourceResponse, status_code=201)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    """Create a new resource."""
    db_resource = Resource(
        title=resource.title,
        description=resource.description,
        url=resource.url,
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource


@router.get("", response_model=list[ResourceResponse])
def list_resources(db: Session = Depends(get_db)):
    """List all resources."""
    return db.query(Resource).order_by(Resource.createdAt.desc()).all()


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    """Get a single resource."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(resource_id: int, updates: ResourceUpdate, db: Session = Depends(get_db)):
    """Update a resource."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(resource, key, value)

    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    """Delete a resource."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted"}
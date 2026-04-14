from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from starlette import status
from typing import List, Optional

from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate

def get_specialty(db: Session, specialty_id: int) -> Optional[Specialty]:
    return db.query(Specialty).filter(Specialty.id == specialty_id).first()

def get_specialty_by_name(db: Session, name: str) -> Optional[Specialty]:
    return db.query(Specialty).filter(Specialty.name.ilike(name)).first()

def get_specialties(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Specialty]:
    query = db.query(Specialty)
    if search:
        query = query.filter(Specialty.name.ilike(f"%{search}%"))
    return query.order_by(Specialty.name).offset(skip).limit(limit).all()

def create_specialty(db: Session, specialty_in: SpecialtyCreate) -> Specialty:
    db_specialty = Specialty(
        name=specialty_in.name,
        description=specialty_in.description
    )
    db.add(db_specialty)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La especialidad '{specialty_in.name}' ya existe."
        )
    db.refresh(db_specialty)
    return db_specialty

def update_specialty(db: Session, db_specialty: Specialty, specialty_in: SpecialtyUpdate) -> Specialty:
    update_data = specialty_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_specialty, field, value)

    db.add(db_specialty)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe otra especialidad con ese nombre."
        )
    db.refresh(db_specialty)
    return db_specialty

def delete_specialty(db: Session, specialty_id: int) -> Optional[Specialty]:
    db_specialty = get_specialty(db, specialty_id)
    if not db_specialty:
        return None
    
    db.delete(db_specialty)
    db.commit()
    return db_specialty
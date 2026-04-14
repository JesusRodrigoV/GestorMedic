from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate

def get_specialty(db: Session, specialty_id: int) -> Optional[Specialty]:
    stmt = select(Specialty).where(Specialty.id == specialty_id)
    return db.execute(stmt).scalar_one_or_none()

def get_specialty_by_name(db: Session, name: str) -> Optional[Specialty]:
    stmt = select(Specialty).where(Specialty.name.ilike(name.strip()))
    return db.execute(stmt).scalar_one_or_none()

def get_specialties(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None
) -> List[Specialty]:
    stmt = select(Specialty)
    
    if search:
        search_filter = f"%{search}%"
        stmt = stmt.where(
            or_(
                Specialty.name.ilike(search_filter),
                Specialty.description.ilike(search_filter)
            )
        )
    
    stmt = stmt.order_by(Specialty.name).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())

def create_specialty(db: Session, specialty_in: SpecialtyCreate) -> Specialty:
    """Crea una nueva especialidad médica."""
    specialty_in.name = specialty_in.name.strip()
    
    db_specialty = Specialty(**specialty_in.model_dump())
    
    db.add(db_specialty)
    try:
        db.commit()
        db.refresh(db_specialty)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La especialidad '{specialty_in.name}' ya esta registrada"
        )
    return db_specialty

def update_specialty(db: Session, db_specialty: Specialty, specialty_in: SpecialtyUpdate) -> Specialty:
    update_data = specialty_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "name" and value:
            value = value.strip()
        setattr(db_specialty, field, value)

    try:
        db.commit()
        db.refresh(db_specialty)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe otra especialidad con ese nombre"
        )
    return db_specialty

def delete_specialty(db: Session, specialty_id: int) -> bool:

    db_specialty = get_specialty(db, specialty_id)
    if not db_specialty:
        return False
    
    db.delete(db_specialty)
    db.commit()
    return True
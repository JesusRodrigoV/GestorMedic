from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import Optional

from app.models.staff_profile import StaffProfile
from app.schemas.staff_profile import StaffProfileCreate, StaffProfileUpdate

def get_staff(db: Session, profile_id: int) -> Optional[StaffProfile]:
    stmt = select(StaffProfile).where(StaffProfile.id == profile_id)
    return db.execute(stmt).scalar_one_or_none()

def get_staff_by_user_id(db: Session, user_id: int) -> Optional[StaffProfile]:
    stmt = select(StaffProfile).where(StaffProfile.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def create_staff(db: Session, profile_in: StaffProfileCreate) -> StaffProfile:
    if get_staff_by_user_id(db, profile_in.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya tiene un perfil de personal administrativo creado."
        )

    db_profile = StaffProfile(**profile_in.model_dump())
    
    db.add(db_profile)
    try:
        db.commit()
        db.refresh(db_profile)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El ID de empleado ya está asignado a otro miembro del personal."
        )
    return db_profile

def update_staff(db: Session, db_profile: StaffProfile, profile_in: StaffProfileUpdate) -> StaffProfile:
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    try:
        db.commit()
        db.refresh(db_profile)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflicto de integridad al actualizar los datos del personal."
        )
    return db_profile

def delete_staff(db: Session, profile_id: int) -> bool:
    db_profile = get_staff(db, profile_id)
    if not db_profile:
        return False
    db.delete(db_profile)
    db.commit()
    return True
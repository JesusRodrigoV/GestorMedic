from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from starlette import status
from typing import Optional

from app.models.staff_profile import StaffProfile
from app.schemas.staff_profile import StaffProfileCreate, StaffProfileUpdate

def get_staff(db: Session, profile_id: int) -> Optional[StaffProfile]:
    return db.query(StaffProfile).filter(StaffProfile.id == profile_id).first()

def get_staff_by_user_id(db: Session, user_id: int) -> Optional[StaffProfile]:
    return db.query(StaffProfile).filter(StaffProfile.user_id == user_id).first()

def create_staff(db: Session, profile_in: StaffProfileCreate) -> StaffProfile:
    db_profile = StaffProfile(
        user_id=profile_in.user_id,
        employee_id=profile_in.employee_id,
        position=profile_in.position
    )
    db.add(db_profile)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Error al crear perfil de personal: {e.orig}"
        )
    db.refresh(db_profile)
    return db_profile

def update_staff(db: Session, db_profile: StaffProfile, profile_in: StaffProfileUpdate) -> StaffProfile:
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    db.add(db_profile)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Conflicto al actualizar personal: {e.orig}"
        )
    db.refresh(db_profile)
    return db_profile
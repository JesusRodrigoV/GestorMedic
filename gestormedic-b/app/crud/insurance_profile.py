from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import Optional

from app.models.insurance_profile import InsuranceProfile
from app.schemas.insurance_profile import InsuranceProfileCreate, InsuranceProfileUpdate

def get_insurance(db: Session, profile_id: int) -> Optional[InsuranceProfile]:
    stmt = select(InsuranceProfile).where(InsuranceProfile.id == profile_id)
    return db.execute(stmt).scalar_one_or_none()

def get_insurance_by_user_id(db: Session, user_id: int) -> Optional[InsuranceProfile]:
    stmt = select(InsuranceProfile).where(InsuranceProfile.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def create_insurance(db: Session, profile_in: InsuranceProfileCreate) -> InsuranceProfile:
    if get_insurance_by_user_id(db, profile_in.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este usuario ya está registrado como aseguradora."
        )

    db_profile = InsuranceProfile(**profile_in.model_dump())
    
    db.add(db_profile)
    try:
        db.commit()
        db.refresh(db_profile)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El Tax ID (NIT/RUC) ya se encuentra registrado."
        )
    return db_profile

def update_insurance(db: Session, db_profile: InsuranceProfile, profile_in: InsuranceProfileUpdate) -> InsuranceProfile:
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    try:
        db.commit()
        db.refresh(db_profile)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Error de duplicidad en los datos de la aseguradora.")
    return db_profile

def delete_insurance(db: Session, profile_id: int) -> bool:
    stmt = select(InsuranceProfile).where(InsuranceProfile.id == profile_id)
    db_profile = db.execute(stmt).scalar_one_or_none()
    if not db_profile:
        return False
    db.delete(db_profile)
    db.commit()
    return True
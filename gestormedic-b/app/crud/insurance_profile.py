from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from starlette import status
from typing import Optional

from app.models.insurance_profile import InsuranceProfile
from app.schemas.insurance_profile import InsuranceProfileCreate, InsuranceProfileUpdate

def get_insurance(db: Session, profile_id: int) -> Optional[InsuranceProfile]:
    return db.query(InsuranceProfile).filter(InsuranceProfile.id == profile_id).first()

def get_insurance_by_user_id(db: Session, user_id: int) -> Optional[InsuranceProfile]:
    return db.query(InsuranceProfile).filter(InsuranceProfile.user_id == user_id).first()

def create_insurance(db: Session, profile_in: InsuranceProfileCreate) -> InsuranceProfile:
    db_profile = InsuranceProfile(
        user_id=profile_in.user_id,
        company_name=profile_in.company_name,
        tax_id=profile_in.tax_id,
        contact_person=profile_in.contact_person,
        contact_phone=profile_in.contact_phone,
        contact_email=profile_in.contact_email,
        office_address=profile_in.office_address
    )
    db.add(db_profile)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Error al crear perfil de aseguradora: {e.orig}"
        )
    db.refresh(db_profile)
    return db_profile

def update_insurance(db: Session, db_profile: InsuranceProfile, profile_in: InsuranceProfileUpdate) -> InsuranceProfile:
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
            detail=f"Conflicto al actualizar aseguradora: {e.orig}"
        )
    db.refresh(db_profile)
    return db_profile
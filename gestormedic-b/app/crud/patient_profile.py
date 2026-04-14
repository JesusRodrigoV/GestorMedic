from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from starlette import status
from typing import Optional

from app.models.patient_profile import PatientProfile
from app.schemas.patient_profile import PatientProfileCreate, PatientProfileUpdate

def get_patient(db: Session, profile_id: int) -> Optional[PatientProfile]:
    return db.query(PatientProfile).filter(PatientProfile.id == profile_id).first()

def get_patient_by_user_id(db: Session, user_id: int) -> Optional[PatientProfile]:
    return db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()

def get_patient_by_ci(db: Session, ci_number: str) -> Optional[PatientProfile]:
    return db.query(PatientProfile).filter(PatientProfile.ci_number == ci_number).first()

def create_patient(db: Session, profile_in: PatientProfileCreate) -> PatientProfile:
    db_profile = PatientProfile(
        user_id=profile_in.user_id,
        ci_number=profile_in.ci_number,
        date_of_birth=profile_in.date_of_birth,
        gender=profile_in.gender,
        blood_type=profile_in.blood_type,
        allergies=profile_in.allergies,
        occupation=profile_in.occupation,
        emergency_contact_name=profile_in.emergency_contact_name,
        emergency_contact_phone=profile_in.emergency_contact_phone
    )
    db.add(db_profile)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Error al crear perfil de paciente (CI o Usuario duplicado): {e.orig}"
        )
    db.refresh(db_profile)
    return db_profile

def update_patient(db: Session, db_profile: PatientProfile, profile_in: PatientProfileUpdate) -> PatientProfile:
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
            detail=f"Conflicto al actualizar paciente: {e.orig}"
        )
    db.refresh(db_profile)
    return db_profile
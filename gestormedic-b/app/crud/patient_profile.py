from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import Optional

from app.models.patient_profile import PatientProfile
from app.schemas.patient_profile import PatientProfileCreate, PatientProfileUpdate

def get_patient(db: Session, profile_id: int) -> Optional[PatientProfile]:
    stmt = select(PatientProfile).where(PatientProfile.id == profile_id)
    return db.execute(stmt).scalar_one_or_none()

def get_patient_by_user_id(db: Session, user_id: int) -> Optional[PatientProfile]:
    stmt = select(PatientProfile).where(PatientProfile.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def get_patient_by_ci(db: Session, ci_number: str) -> Optional[PatientProfile]:
    stmt = select(PatientProfile).where(PatientProfile.ci_number == ci_number)
    return db.execute(stmt).scalar_one_or_none()

def create_patient(db: Session, profile_in: PatientProfileCreate) -> PatientProfile:
    if get_patient_by_user_id(db, profile_in.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya tiene un perfil de paciente creado."
        )

    db_profile = PatientProfile(**profile_in.model_dump())
    
    db.add(db_profile)
    try:
        db.commit()
        db.refresh(db_profile)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Error de duplicidad: El número de CI ya está registrado en el sistema."
        )
    return db_profile

def update_patient(db: Session, db_profile: PatientProfile, profile_in: PatientProfileUpdate) -> PatientProfile:
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
            detail="Error de duplicidad al actualizar: El CI ya pertenece a otro paciente."
        )
    return db_profile

def delete_patient(db: Session, profile_id: int) -> bool:
    db_profile = get_patient(db, profile_id)
    if not db_profile:
        return False
    db.delete(db_profile)
    db.commit()
    return True
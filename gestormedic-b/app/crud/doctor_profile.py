from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from starlette import status
from typing import Optional

from app.models.doctor_profile import DoctorProfile
from app.models.specialty import Specialty
from app.schemas.doctor_profile import DoctorProfileCreate, DoctorProfileUpdate

def get_doctor(db: Session, profile_id: int) -> Optional[DoctorProfile]:
    return db.query(DoctorProfile).options(
        joinedload(DoctorProfile.specialties)
    ).filter(DoctorProfile.id == profile_id).first()

def get_doctor_by_user_id(db: Session, user_id: int) -> Optional[DoctorProfile]:
    return db.query(DoctorProfile).options(
        joinedload(DoctorProfile.specialties)
    ).filter(DoctorProfile.user_id == user_id).first()

def create_doctor(db: Session, profile_in: DoctorProfileCreate) -> DoctorProfile:
    db_profile = DoctorProfile(
        user_id=profile_in.user_id,
        license_number=profile_in.license_number,
        bio=profile_in.bio,
        experience_years=profile_in.experience_years,
        signature_url=profile_in.signature_url,
        base_consultation_price=profile_in.base_consultation_price,
        is_telemedicine_enabled=profile_in.is_telemedicine_enabled
    )
    
    if profile_in.specialty_ids:
        specialties = db.query(Specialty).filter(Specialty.id.in_(profile_in.specialty_ids)).all()
        if len(specialties) != len(profile_in.specialty_ids):
            raise HTTPException(status_code=400, detail="Una o más especialidades no existen en el catálogo.")
        db_profile.specialties = specialties

    db.add(db_profile)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Error al crear perfil de médico (Matrícula o Usuario duplicado): {e.orig}"
        )
    db.refresh(db_profile)
    return db_profile

def update_doctor(db: Session, db_profile: DoctorProfile, profile_in: DoctorProfileUpdate) -> DoctorProfile:
    update_data = profile_in.model_dump(exclude_unset=True, exclude={"specialty_ids"})
    
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    if profile_in.specialty_ids is not None:
        specialties = db.query(Specialty).filter(Specialty.id.in_(profile_in.specialty_ids)).all()
        if len(specialties) != len(profile_in.specialty_ids):
            raise HTTPException(status_code=400, detail="Una o más especialidades no existen en el catálogo.")
        db_profile.specialties = specialties

    db.add(db_profile)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Conflicto al actualizar médico: {e.orig}"
        )
    db.refresh(db_profile)
    return db_profile
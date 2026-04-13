from sqlalchemy import select, in_
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import Optional, List

from app.models.doctor_profile import DoctorProfile
from app.models.specialty import Specialty
from app.schemas.doctor_profile import DoctorProfileCreate, DoctorProfileUpdate

def get_doctor(db: Session, profile_id: int) -> Optional[DoctorProfile]:
    stmt = (
        select(DoctorProfile)
        .options(joinedload(DoctorProfile.specialties))
        .where(DoctorProfile.id == profile_id)
    )
    return db.execute(stmt).scalar_one_or_none()

def get_doctor_by_user_id(db: Session, user_id: int) -> Optional[DoctorProfile]:
    stmt = (
        select(DoctorProfile)
        .options(joinedload(DoctorProfile.specialties))
        .where(DoctorProfile.user_id == user_id)
    )
    return db.execute(stmt).scalar_one_or_none()

def create_doctor(db: Session, profile_in: DoctorProfileCreate) -> DoctorProfile:
    if get_doctor_by_user_id(db, profile_in.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya tiene un perfil médico creado"
        )

    obj_in_data = profile_in.model_dump(exclude={"specialty_ids"})
    db_profile = DoctorProfile(**obj_in_data)
    
    if profile_in.specialty_ids:
        spec_stmt = select(Specialty).where(Specialty.id.in_(profile_in.specialty_ids))
        specialties = db.execute(spec_stmt).scalars().all()
        
        if len(specialties) != len(profile_in.specialty_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Una o más especialidades no son válidas."
            )
        db_profile.specialties = list(specialties)

    db.add(db_profile)
    try:
        db.commit()
        db.refresh(db_profile)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La matrícula profesional ya está registrada por otro médico."
        )
    return db_profile

def update_doctor(db: Session, db_profile: DoctorProfile, profile_in: DoctorProfileUpdate) -> DoctorProfile:
    update_data = profile_in.model_dump(exclude_unset=True, exclude={"specialty_ids"})
    
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    if profile_in.specialty_ids is not None:
        spec_stmt = select(Specialty).where(Specialty.id.in_(profile_in.specialty_ids))
        specialties = db.execute(spec_stmt).scalars().all()
        db_profile.specialties = list(specialties)

    try:
        db.commit()
        db.refresh(db_profile)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Conflicto de integridad en la actualización.")
    return db_profile

def delete_doctor(db: Session, profile_id: int) -> bool:
    db_profile = get_doctor(db, profile_id)
    if not db_profile:
        return False
    db.delete(db_profile)
    db.commit()
    return True
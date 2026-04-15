from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import Optional, List

from app.models.doctor_profile import DoctorProfile
from app.models.specialty import Specialty
from app.schemas.doctor_profile import DoctorProfileCreate, DoctorProfileUpdate

async def get_doctor(db: AsyncSession, profile_id: int) -> Optional[DoctorProfile]:
    stmt = (
        select(DoctorProfile)
        .options(joinedload(DoctorProfile.specialties))
        .where(DoctorProfile.id == profile_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_doctor_by_user_id(db: AsyncSession, user_id: int) -> Optional[DoctorProfile]:
    stmt = (
        select(DoctorProfile)
        .options(joinedload(DoctorProfile.specialties))
        .where(DoctorProfile.user_id == user_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def create_doctor(db: AsyncSession, profile_in: DoctorProfileCreate) -> DoctorProfile:
    existing = await get_doctor_by_user_id(db, profile_in.user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya tiene un perfil médico creado"
        )

    obj_in_data = profile_in.model_dump(exclude={"specialty_ids"})
    db_profile = DoctorProfile(**obj_in_data)
    
    if profile_in.specialty_ids:
        spec_stmt = select(Specialty).where(Specialty.id.in_(profile_in.specialty_ids))
        spec_result = await db.execute(spec_stmt)
        specialties = spec_result.scalars().all()
        
        if len(list(specialties)) != len(profile_in.specialty_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Una o más especialidades no son válidas."
            )
        db_profile.specialties = list(specialties)

    db.add(db_profile)
    try:
        await db.commit()
        await db.refresh(db_profile)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La matrícula profesional ya está registrada por otro médico."
        )
    return db_profile

async def update_doctor(db: AsyncSession, db_profile: DoctorProfile, profile_in: DoctorProfileUpdate) -> DoctorProfile:
    update_data = profile_in.model_dump(exclude_unset=True, exclude={"specialty_ids"})
    
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    if profile_in.specialty_ids is not None:
        spec_stmt = select(Specialty).where(Specialty.id.in_(profile_in.specialty_ids))
        spec_result = await db.execute(spec_stmt)
        specialties = spec_result.scalars().all()
        db_profile.specialties = list(specialties)

    try:
        await db.commit()
        await db.refresh(db_profile)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Conflicto de integridad en la actualización.")
    return db_profile

async def delete_doctor(db: AsyncSession, profile_id: int) -> bool:
    db_profile = await get_doctor(db, profile_id)
    if not db_profile:
        return False
    await db.delete(db_profile)
    await db.commit()
    return True
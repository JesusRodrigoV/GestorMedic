from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import Optional

from app.models.patient_profile import PatientProfile
from app.schemas.patient_profile import PatientProfileCreate, PatientProfileUpdate

async def get_patient(db: AsyncSession, profile_id: int) -> Optional[PatientProfile]:
    stmt = select(PatientProfile).where(PatientProfile.id == profile_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_patient_by_user_id(db: AsyncSession, user_id: int) -> Optional[PatientProfile]:
    stmt = select(PatientProfile).where(PatientProfile.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_patient_by_ci(db: AsyncSession, ci_number: str) -> Optional[PatientProfile]:
    stmt = select(PatientProfile).where(PatientProfile.ci_number == ci_number)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def create_patient(db: AsyncSession, profile_in: PatientProfileCreate) -> PatientProfile:
    existing = await get_patient_by_user_id(db, profile_in.user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya tiene un perfil de paciente creado."
        )

    db_profile = PatientProfile(**profile_in.model_dump())
    
    db.add(db_profile)
    try:
        await db.commit()
        await db.refresh(db_profile)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Error de duplicidad: El nUmero de CI ya está registrado en el sistema."
        )
    return db_profile

async def update_patient(db: AsyncSession, db_profile: PatientProfile, profile_in: PatientProfileUpdate) -> PatientProfile:
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    try:
        await db.commit()
        await db.refresh(db_profile)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Error de duplicidad al actualizar: El CI ya pertenece a otro paciente."
        )
    return db_profile

async def delete_patient(db: AsyncSession, profile_id: int) -> bool:
    db_profile = await get_patient(db, profile_id)
    if not db_profile:
        return False
    await db.delete(db_profile)
    await db.commit()
    return True
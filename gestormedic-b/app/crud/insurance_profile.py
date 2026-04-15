from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import Optional

from app.models.insurance_profile import InsuranceProfile
from app.schemas.insurance_profile import InsuranceProfileCreate, InsuranceProfileUpdate

async def get_insurance(db: AsyncSession, profile_id: int) -> Optional[InsuranceProfile]:
    stmt = select(InsuranceProfile).where(InsuranceProfile.id == profile_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_insurance_by_user_id(db: AsyncSession, user_id: int) -> Optional[InsuranceProfile]:
    stmt = select(InsuranceProfile).where(InsuranceProfile.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def create_insurance(db: AsyncSession, profile_in: InsuranceProfileCreate) -> InsuranceProfile:
    existing = await get_insurance_by_user_id(db, profile_in.user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este usuario ya está registrado como aseguradora."
        )

    db_profile = InsuranceProfile(**profile_in.model_dump())
    
    db.add(db_profile)
    try:
        await db.commit()
        await db.refresh(db_profile)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El Tax ID (NIT/RUC) ya se encuentra registrado."
        )
    return db_profile

async def update_insurance(db: AsyncSession, db_profile: InsuranceProfile, profile_in: InsuranceProfileUpdate) -> InsuranceProfile:
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    try:
        await db.commit()
        await db.refresh(db_profile)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Error de duplicidad en los datos de la aseguradora.")
    return db_profile

async def delete_insurance(db: AsyncSession, profile_id: int) -> bool:
    db_profile = await get_insurance(db, profile_id)
    if not db_profile:
        return False
    await db.delete(db_profile)
    await db.commit()
    return True
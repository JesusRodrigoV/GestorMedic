from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import Optional

from app.models.staff_profile import StaffProfile
from app.schemas.staff_profile import StaffProfileCreate, StaffProfileUpdate

async def get_staff(db: AsyncSession, profile_id: int) -> Optional[StaffProfile]:
    stmt = select(StaffProfile).where(StaffProfile.id == profile_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_staff_by_user_id(db: AsyncSession, user_id: int) -> Optional[StaffProfile]:
    stmt = select(StaffProfile).where(StaffProfile.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def create_staff(db: AsyncSession, profile_in: StaffProfileCreate) -> StaffProfile:
    existing = await get_staff_by_user_id(db, profile_in.user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya tiene un perfil de personal administrativo creado."
        )

    db_profile = StaffProfile(**profile_in.model_dump())
    
    db.add(db_profile)
    try:
        await db.commit()
        await db.refresh(db_profile)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El ID de empleado ya está asignado a otro miembro del personal."
        )
    return db_profile

async def update_staff(db: AsyncSession, db_profile: StaffProfile, profile_in: StaffProfileUpdate) -> StaffProfile:
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
            detail="Conflicto de integridad al actualizar los datos del personal."
        )
    return db_profile

async def delete_staff(db: AsyncSession, profile_id: int) -> bool:
    db_profile = await get_staff(db, profile_id)
    if not db_profile:
        return False
    await db.delete(db_profile)
    await db.commit()
    return True
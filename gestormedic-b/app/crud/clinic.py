from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.clinic import Clinic
from app.schemas.clinic import ClinicCreate, ClinicUpdate

async def get_clinic(db: AsyncSession, clinic_id: int) -> Optional[Clinic]:
    stmt = select(Clinic).where(Clinic.id == clinic_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_clinic_by_nit(db: AsyncSession, nit_ruc: str) -> Optional[Clinic]:
    stmt = select(Clinic).where(Clinic.nit_ruc == nit_ruc)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_clinics(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100, 
    is_active: Optional[bool] = None
) -> List[Clinic]:
    stmt = select(Clinic)
    if is_active is not None:
        stmt = stmt.where(Clinic.is_active == is_active)
        
    stmt = stmt.order_by(Clinic.id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def create_clinic(db: AsyncSession, clinic_in: ClinicCreate) -> Clinic:
    obj_in_data = clinic_in.model_dump()
    obj_in_data["is_active"] = True 
    db_clinic = Clinic(**obj_in_data)
    
    db.add(db_clinic)
    try:
        await db.commit()
        await db.refresh(db_clinic)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La clínica con NIT/RUC {clinic_in.nit_ruc} ya se encuentra registrada."
        )
    return db_clinic

async def update_clinic(db: AsyncSession, db_clinic: Clinic, clinic_in: ClinicUpdate) -> Clinic:
    update_data = clinic_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_clinic, field, value)

    try:
        await db.commit()
        await db.refresh(db_clinic)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El NIT/RUC proporcionado choca con los registros de otra clínica."
        )
    return db_clinic

async def delete_clinic(db: AsyncSession, clinic_id: int) -> bool:
    db_clinic = await get_clinic(db, clinic_id)
    if not db_clinic:
        return False
    
    await db.delete(db_clinic)
    await db.commit()
    return True
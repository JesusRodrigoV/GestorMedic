from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate

async def get_specialty(db: AsyncSession, specialty_id: int) -> Optional[Specialty]:
    stmt = select(Specialty).where(Specialty.id == specialty_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_specialty_by_name(db: AsyncSession, name: str) -> Optional[Specialty]:
    stmt = select(Specialty).where(Specialty.name.ilike(name.strip()))
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_specialties(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None
) -> List[Specialty]:
    stmt = select(Specialty)
    
    if search:
        search_filter = f"%{search}%"
        stmt = stmt.where(
            or_(
                Specialty.name.ilike(search_filter),
                Specialty.description.ilike(search_filter)
            )
        )
    
    stmt = stmt.order_by(Specialty.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def create_specialty(db: AsyncSession, specialty_in: SpecialtyCreate) -> Specialty:
    """Crea una nueva especialidad médica."""
    specialty_in.name = specialty_in.name.strip()
    
    db_specialty = Specialty(**specialty_in.model_dump())
    
    db.add(db_specialty)
    try:
        await db.commit()
        await db.refresh(db_specialty)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La especialidad '{specialty_in.name}' ya está registrada"
        )
    return db_specialty

async def update_specialty(db: AsyncSession, db_specialty: Specialty, specialty_in: SpecialtyUpdate) -> Specialty:
    update_data = specialty_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "name" and value:
            value = value.strip()
        setattr(db_specialty, field, value)

    try:
        await db.commit()
        await db.refresh(db_specialty)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe otra especialidad con ese nombre"
        )
    return db_specialty

async def delete_specialty(db: AsyncSession, specialty_id: int) -> bool:
    db_specialty = await get_specialty(db, specialty_id)
    if not db_specialty:
        return False
    
    await db.delete(db_specialty)
    await db.commit()
    return True

def get_specialties_query(search: Optional[str] = None):
    stmt = select(Specialty)
    
    if search:
        search_filter = f"%{search}%"
        stmt = stmt.where(
            or_(
                Specialty.name.ilike(search_filter),
                Specialty.description.ilike(search_filter)
            )
        )
    
    return stmt.order_by(Specialty.name)
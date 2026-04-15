from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.clinic import Clinic
from app.schemas.clinic import ClinicCreate, ClinicUpdate

def get_clinic(db: Session, clinic_id: int) -> Optional[Clinic]:
    stmt = select(Clinic).where(Clinic.id == clinic_id)
    return db.execute(stmt).scalar_one_or_none()

def get_clinic_by_nit(db: Session, nit_ruc: str) -> Optional[Clinic]:
    stmt = select(Clinic).where(Clinic.nit_ruc == nit_ruc)
    return db.execute(stmt).scalar_one_or_none()

def get_clinics(db: Session, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None) -> List[Clinic]:
    stmt = select(Clinic)
    if is_active is not None:
        stmt = stmt.where(Clinic.is_active == is_active)
        
    stmt = stmt.order_by(Clinic.id).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())

def create_clinic(db: Session, clinic_in: ClinicCreate) -> Clinic:
    obj_in_data = clinic_in.model_dump()
    obj_in_data["is_active"] = True
    db_clinic = Clinic(**obj_in_data)
    
    db.add(db_clinic)
    try:
        db.commit()
        db.refresh(db_clinic)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La clínica con NIT/RUC {clinic_in.nit_ruc} ya se encuentra registrada."
        )
    return db_clinic

def update_clinic(db: Session, db_clinic: Clinic, clinic_in: ClinicUpdate) -> Clinic:
    update_data = clinic_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_clinic, field, value)

    try:
        db.commit()
        db.refresh(db_clinic)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El NIT/RUC proporcionado choca con los registros de otra clínica."
        )
    return db_clinic

def delete_clinic(db: Session, clinic_id: int) -> bool:
    db_clinic = get_clinic(db, clinic_id)
    if not db_clinic:
        return False
    
    db.delete(db_clinic)
    db.commit()
    return True
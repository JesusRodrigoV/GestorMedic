from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from starlette import status
from typing import List, Optional

from app.models.clinic import Clinic
from app.schemas.clinic import ClinicCreate, ClinicUpdate

def get_clinic(db: Session, clinic_id: int) -> Optional[Clinic]:
    return db.query(Clinic).filter(Clinic.id == clinic_id).first()

def get_clinic_by_nit(db: Session, nit_ruc: str) -> Optional[Clinic]:
    return db.query(Clinic).filter(Clinic.nit_ruc == nit_ruc).first()

def get_clinics(db: Session, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None) -> List[Clinic]:
    query = db.query(Clinic)
    if is_active is not None:
        query = query.filter(Clinic.is_active == is_active)
    return query.order_by(Clinic.id).offset(skip).limit(limit).all()

def create_clinic(db: Session, clinic_in: ClinicCreate) -> Clinic:
    db_clinic = Clinic(
        name=clinic_in.name,
        nit_ruc=clinic_in.nit_ruc,
        address=clinic_in.address,
        phone=clinic_in.phone,
        logo_url=clinic_in.logo_url,
        plan=clinic_in.plan,
        is_active=True
    )
    db.add(db_clinic)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La clínica con NIT/RUC {clinic_in.nit_ruc} ya existe."
        )
    db.refresh(db_clinic)
    return db_clinic

def update_clinic(db: Session, db_clinic: Clinic, clinic_in: ClinicUpdate) -> Clinic:
    update_data = clinic_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_clinic, field, value)

    db.add(db_clinic)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Conflicto de datos al actualizar la clínica: {e.orig}"
        )
    db.refresh(db_clinic)
    return db_clinic

def delete_clinic(db: Session, clinic_id: int) -> Optional[Clinic]:
    db_clinic = get_clinic(db, clinic_id)
    if not db_clinic:
        return None
    
    db.delete(db_clinic)
    db.commit()
    return db_clinic
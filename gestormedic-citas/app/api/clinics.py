from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_db
from app.models.clinic import Room, ClinicDoctor
from app.models.user import User
from app.models.doctor_profile import DoctorProfile
from app.core.dependencies import require_admin_clinica, verify_tenant_access

router = APIRouter(prefix="/clinics", tags=["Clinics"])

class RoomCreate(BaseModel):
    name: str
    description: str | None = None
    is_active: bool = True

class DoctorLinkPayload(BaseModel):
    doctor_profile_id: int

@router.post("/{clinic_id}/rooms")
async def create_clinic_room(
    clinic_id: int,
    payload: RoomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_clinica)
):
    await verify_tenant_access(clinic_id=clinic_id, current_user=current_user)

    new_room = Room(
        clinic_id=clinic_id,
        name=payload.name,
        description=payload.description,
        is_active=payload.is_active
    )
    
    db.add(new_room)
    await db.commit()
    await db.refresh(new_room)
    
    return new_room

@router.post("/{clinic_id}/doctors")
async def link_doctor_to_clinic(
    clinic_id: int,
    payload: DoctorLinkPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_clinica)
):
    await verify_tenant_access(clinic_id=clinic_id, current_user=current_user)

    doctor_stmt = select(DoctorProfile).where(DoctorProfile.id == payload.doctor_profile_id)
    doctor_result = await db.execute(doctor_stmt)
    doctor = doctor_result.scalar_one_or_none()

    if not doctor:
        raise HTTPException(status_code=404, detail="Perfil de doctor no encontrado.")

    link_stmt = select(ClinicDoctor).where(
        ClinicDoctor.clinic_id == clinic_id,
        ClinicDoctor.doctor_id == payload.doctor_profile_id
    )
    link_result = await db.execute(link_stmt)
    existing_link = link_result.scalar_one_or_none()

    if existing_link:
        raise HTTPException(status_code=400, detail="El doctor ya está vinculado a esta clínica.")

    new_link = ClinicDoctor(
        clinic_id=clinic_id,
        doctor_id=payload.doctor_profile_id,
        is_active=True
    )
    
    db.add(new_link)
    await db.commit()
    
    return {"message": "Doctor vinculado exitosamente a la clínica."}
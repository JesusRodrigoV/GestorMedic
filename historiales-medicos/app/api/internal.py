from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import require_internal_key
from app.db.mongo import get_mongo_db
from app.schemas.common import InternalAppointmentBootstrapIn, InternalPatientBootstrapIn
from app.services.histories_service import ensure_general_history, ensure_history_from_appointment


router = APIRouter(prefix='/internal', tags=['Internal'])


@router.post('/patients/bootstrap')
async def bootstrap_patient_history(
    payload: InternalPatientBootstrapIn,
    _: None = Depends(require_internal_key),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    await ensure_general_history(db, payload.patient_user_id)
    return {'ok': True}


@router.post('/appointments/bootstrap')
async def bootstrap_history_for_appointment(
    payload: InternalAppointmentBootstrapIn,
    _: None = Depends(require_internal_key),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    await ensure_general_history(db, payload.patient_user_id)
    await ensure_history_from_appointment(
        db,
        patient_user_id=payload.patient_user_id,
        doctor_profile_id=payload.doctor_profile_id,
        doctor_name=None,
        specialty_id=payload.specialty_id,
        specialty_name=payload.specialty_name,
    )
    return {'ok': True}

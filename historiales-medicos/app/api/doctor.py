from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_doctor
from app.core.config import settings
from app.db.mongo import get_mongo_db
from app.db.postgres import get_db
from app.models.external import Appointment
from app.schemas.common import ConsultationEntryIn, ConsultationEntryOut, ConsultationEntryPatchIn, PatientFileOut
from app.services.files_service import AppwriteStorageService, get_patient_file, list_patient_files
from app.services.histories_service import (
    add_consultation_entry,
    ensure_history_from_appointment,
    list_doctor_editable_entries,
    list_patient_histories,
    patch_doctor_entry,
)


router = APIRouter(prefix='/doctor', tags=['Doctor Medical Histories'])


async def _assert_doctor_has_patient_access(db: AsyncSession, doctor_profile_id: int, patient_user_id: int):
    linked_appointment = (
        await db.execute(
            select(Appointment.id).where(
                Appointment.doctor_id == doctor_profile_id,
                Appointment.patient_user_id == patient_user_id,
            )
        )
    ).scalar_one_or_none()
    if not linked_appointment:
        raise HTTPException(
            status_code=403,
            detail='No tienes autorizacion para ver archivos de este paciente',
        )


@router.get('/histories/patients/{patient_user_id}')
async def list_patient_histories_for_doctor(
    patient_user_id: int,
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    return await list_patient_histories(db, patient_user_id)


@router.get('/patients/{patient_user_id}/files', response_model=list[PatientFileOut])
async def list_patient_files_for_doctor(
    patient_user_id: int,
    current_user: CurrentUser = Depends(require_doctor),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
    pg_db: AsyncSession = Depends(get_db),
):
    if not current_user.doctor_profile_id:
        raise HTTPException(status_code=404, detail='Perfil medico no encontrado')

    await _assert_doctor_has_patient_access(pg_db, current_user.doctor_profile_id, patient_user_id)
    return await list_patient_files(mongo_db, patient_user_id)


@router.get('/patients/{patient_user_id}/files/{file_id}/content')
async def stream_patient_file_for_doctor(
    patient_user_id: int,
    file_id: str,
    current_user: CurrentUser = Depends(require_doctor),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
    pg_db: AsyncSession = Depends(get_db),
):
    if not current_user.doctor_profile_id:
        raise HTTPException(status_code=404, detail='Perfil medico no encontrado')

    await _assert_doctor_has_patient_access(pg_db, current_user.doctor_profile_id, patient_user_id)

    meta = await get_patient_file(mongo_db, file_id, patient_user_id)
    if not meta:
        raise HTTPException(status_code=404, detail='Archivo no encontrado')

    storage = AppwriteStorageService()
    content = storage.download_file(meta['appwrite_file_id'])
    return Response(
        content=content,
        media_type=meta['content_type'] or 'application/octet-stream',
        headers={'Content-Disposition': f'inline; filename="{meta["original_name"]}"'},
    )


@router.get('/histories/editable-entries', response_model=list[ConsultationEntryOut])
async def list_editable_entries(
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    if not current_user.doctor_profile_id:
        raise HTTPException(status_code=404, detail='Perfil medico no encontrado')
    return await list_doctor_editable_entries(db, current_user.doctor_profile_id)


@router.post('/histories/entries', response_model=ConsultationEntryOut)
async def create_consultation_entry(
    payload: ConsultationEntryIn,
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    if not current_user.doctor_profile_id:
        raise HTTPException(status_code=404, detail='Perfil medico no encontrado')

    await ensure_history_from_appointment(
        db,
        patient_user_id=payload.patient_user_id,
        doctor_profile_id=current_user.doctor_profile_id,
        doctor_name=current_user.username,
        specialty_id=payload.specialty_id,
        specialty_name=payload.specialty_name,
    )

    history_key = f'specialty:{payload.specialty_id}:doctor:{current_user.doctor_profile_id}'
    history = await db.medical_histories.find_one(
        {'patient_user_id': payload.patient_user_id, 'history_key': history_key}
    )
    if not history:
        raise HTTPException(status_code=404, detail='No se pudo preparar historial para la consulta')

    return await add_consultation_entry(
        db,
        history_id=str(history['_id']),
        appointment_id=payload.appointment_id,
        patient_user_id=payload.patient_user_id,
        doctor_profile_id=current_user.doctor_profile_id,
        specialty_id=payload.specialty_id,
        specialty_name=payload.specialty_name,
        section_title=payload.section_title,
        notes=payload.notes,
        checklist=payload.checklist,
        structured_fields=payload.structured_fields,
        editable_days=settings.DOCTOR_EDIT_WINDOW_DAYS,
    )


@router.patch('/histories/entries/{entry_id}', response_model=ConsultationEntryOut)
async def update_consultation_entry(
    entry_id: str,
    payload: ConsultationEntryPatchIn,
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    if not current_user.doctor_profile_id:
        raise HTTPException(status_code=404, detail='Perfil medico no encontrado')

    updated = await patch_doctor_entry(
        db,
        entry_id=entry_id,
        doctor_profile_id=current_user.doctor_profile_id,
        section_title=payload.section_title,
        notes=payload.notes,
        checklist=payload.checklist,
        structured_fields=payload.structured_fields,
    )
    if not updated:
        raise HTTPException(status_code=404, detail='Entrada no encontrada')
    if updated.get('forbidden'):
        raise HTTPException(status_code=403, detail='No puedes editar entradas de otro doctor')
    if updated.get('expired'):
        raise HTTPException(status_code=409, detail='La ventana de 3 dias para editar ya expiro')
    return updated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import CurrentUser, require_patient
from app.db.mongo import get_mongo_db
from app.schemas.common import HistoryBasicFieldsUpdateIn, HistoryOut, PatientFileOut
from app.services.files_service import (
    AppwriteStorageService,
    delete_patient_file,
    get_patient_file,
    list_patient_files,
    save_file_metadata,
)
from app.services.histories_service import (
    ensure_general_history,
    get_history,
    list_history_entries,
    list_patient_histories,
    patch_basic_fields,
)


router = APIRouter(prefix='/patient', tags=['Patient Medical Histories'])


@router.post('/histories/bootstrap', status_code=status.HTTP_201_CREATED)
async def bootstrap_general_history(
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    await ensure_general_history(db, current_user.id)
    return {'ok': True}


@router.get('/histories', response_model=list[HistoryOut])
async def get_my_histories(
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    await ensure_general_history(db, current_user.id)
    return await list_patient_histories(db, current_user.id)


@router.get('/histories/{history_id}')
async def get_my_history_detail(
    history_id: str,
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    history = await get_history(db, history_id, current_user.id)
    if not history:
        raise HTTPException(status_code=404, detail='Historial no encontrado')
    entries = await list_history_entries(db, history_id, current_user.id)
    return {'history': history, 'entries': entries}


@router.patch('/histories/{history_id}/basic-fields', response_model=HistoryOut)
async def patch_history_basic_fields(
    history_id: str,
    payload: HistoryBasicFieldsUpdateIn,
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    updated = await patch_basic_fields(db, history_id, current_user.id, payload.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail='Historial no encontrado')
    return updated


@router.post('/files/upload', response_model=PatientFileOut, status_code=status.HTTP_201_CREATED)
async def upload_patient_file(
    uploaded_file: UploadFile = File(...),
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    data = await uploaded_file.read()
    max_bytes = 30 * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail='El archivo supera el limite de 30MB')

    storage = AppwriteStorageService()
    created = storage.upload_file(
        file_name=uploaded_file.filename,
        data=data,
        content_type=uploaded_file.content_type or 'application/octet-stream',
    )
    return await save_file_metadata(
        db,
        patient_user_id=current_user.id,
        appwrite_file_id=created['$id'],
        appwrite_bucket_id=created['bucketId'],
        original_name=uploaded_file.filename,
        content_type=uploaded_file.content_type or 'application/octet-stream',
        size_bytes=len(data),
    )


@router.get('/files', response_model=list[PatientFileOut])
async def get_my_files(
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    return await list_patient_files(db, current_user.id)


@router.get('/files/{file_id}/content')
async def stream_my_file_content(
    file_id: str,
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    meta = await get_patient_file(db, file_id, current_user.id)
    if not meta:
        raise HTTPException(status_code=404, detail='Archivo no encontrado')

    storage = AppwriteStorageService()
    content = storage.download_file(meta['appwrite_file_id'])
    return Response(
        content=content,
        media_type=meta['content_type'] or 'application/octet-stream',
        headers={'Content-Disposition': f'inline; filename="{meta["original_name"]}"'},
    )


@router.delete('/files/{file_id}')
async def remove_my_file(
    file_id: str,
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    deleted = await delete_patient_file(db, file_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail='Archivo no encontrado')

    storage = AppwriteStorageService()
    storage.delete_file(deleted['appwrite_file_id'])
    return {'ok': True}

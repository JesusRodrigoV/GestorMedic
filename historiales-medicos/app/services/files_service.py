from datetime import datetime, timezone
import tempfile
from pathlib import Path

from appwrite.client import Client
from appwrite.id import ID
from appwrite.input_file import InputFile
from appwrite.services.storage import Storage
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings


class AppwriteStorageService:
    def __init__(self):
        client = Client()
        client.set_endpoint(settings.APPWRITE_ENDPOINT)
        client.set_project(settings.APPWRITE_PROJECT_ID)
        client.set_key(settings.APPWRITE_API_KEY)
        self.storage = Storage(client)
        self.bucket_id = settings.APPWRITE_BUCKET_PATIENT_FILES

    def upload_file(self, file_name: str, data: bytes, content_type: str):
        tmp_dir = Path(tempfile.gettempdir())
        tmp_path = tmp_dir / f'{ID.unique()}_{file_name}'
        tmp_path.write_bytes(data)
        try:
            result = self.storage.create_file(
                bucket_id=self.bucket_id,
                file_id=ID.unique(),
                file=InputFile.from_path(str(tmp_path), filename=file_name),
            )
        finally:
            if tmp_path.exists():
                tmp_path.unlink()
        return result

    def download_file(self, file_id: str):
        return self.storage.get_file_download(bucket_id=self.bucket_id, file_id=file_id)

    def delete_file(self, file_id: str):
        return self.storage.delete_file(bucket_id=self.bucket_id, file_id=file_id)


async def save_file_metadata(
    db: AsyncIOMotorDatabase,
    *,
    patient_user_id: int,
    appwrite_file_id: str,
    appwrite_bucket_id: str,
    original_name: str,
    content_type: str,
    size_bytes: int,
) -> dict:
    ext = Path(original_name).suffix.lower().replace('.', '')
    doc = {
        'patient_user_id': patient_user_id,
        'appwrite_file_id': appwrite_file_id,
        'appwrite_bucket_id': appwrite_bucket_id,
        'original_name': original_name,
        'content_type': content_type,
        'extension': ext,
        'size_bytes': size_bytes,
        'uploaded_at': datetime.now(timezone.utc),
    }
    insert = await db.patient_files.insert_one(doc)
    doc['_id'] = insert.inserted_id
    return {
        'id': str(doc['_id']),
        **{k: v for k, v in doc.items() if k != '_id'},
    }


async def list_patient_files(db: AsyncIOMotorDatabase, patient_user_id: int) -> list[dict]:
    rows = db.patient_files.find({'patient_user_id': patient_user_id}).sort('uploaded_at', -1)
    return [
        {
            'id': str(doc['_id']),
            'patient_user_id': doc['patient_user_id'],
            'original_name': doc['original_name'],
            'content_type': doc['content_type'],
            'extension': doc.get('extension', ''),
            'size_bytes': doc['size_bytes'],
            'uploaded_at': doc['uploaded_at'],
            'appwrite_file_id': doc['appwrite_file_id'],
            'appwrite_bucket_id': doc['appwrite_bucket_id'],
        }
        async for doc in rows
    ]


async def get_patient_file(db: AsyncIOMotorDatabase, file_id: str, patient_user_id: int) -> dict | None:
    try:
        object_id = ObjectId(file_id)
    except InvalidId:
        return None
    doc = await db.patient_files.find_one({'_id': object_id, 'patient_user_id': patient_user_id})
    if not doc:
        return None
    return {
        'id': str(doc['_id']),
        'patient_user_id': doc['patient_user_id'],
        'original_name': doc['original_name'],
        'content_type': doc['content_type'],
        'extension': doc.get('extension', ''),
        'size_bytes': doc['size_bytes'],
        'uploaded_at': doc['uploaded_at'],
        'appwrite_file_id': doc['appwrite_file_id'],
        'appwrite_bucket_id': doc['appwrite_bucket_id'],
    }


async def delete_patient_file(db: AsyncIOMotorDatabase, file_id: str, patient_user_id: int) -> dict | None:
    try:
        object_id = ObjectId(file_id)
    except InvalidId:
        return None
    doc = await db.patient_files.find_one_and_delete({'_id': object_id, 'patient_user_id': patient_user_id})
    if not doc:
        return None
    return {
        'appwrite_file_id': doc['appwrite_file_id'],
        'id': str(doc['_id']),
    }

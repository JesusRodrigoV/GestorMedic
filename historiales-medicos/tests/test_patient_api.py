from dataclasses import dataclass
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import patient as patient_api
from app.api.deps import require_patient
from app.core.config import settings
from app.db.mongo import get_mongo_db

@dataclass
class DummyUser:
    id: int = 101
    email: str = 'paciente@test.com'
    username: str = 'Paciente Test'
    role_name: str = 'paciente'
    doctor_profile_id: int | None = None


async def _patient_user_override() -> DummyUser:
    return DummyUser()


def build_client() -> TestClient:
    app = FastAPI()
    app.include_router(patient_api.router, prefix=settings.API_V1_STR)
    app.dependency_overrides[require_patient] = _patient_user_override
    app.dependency_overrides[get_mongo_db] = lambda: SimpleNamespace()
    return TestClient(app)


def test_get_histories_ok(monkeypatch):
    async def fake_ensure_general_history(db, patient_user_id):
        assert patient_user_id == 101

    async def fake_list_patient_histories(db, patient_user_id):
        assert patient_user_id == 101
        return [{'id': 'hist-1', 'specialty_name': 'Medicina General', 'history_key': 'general', 'patient_user_id': 101, 'basic_fields': {}, 'created_at': '2026-01-01T00:00:00Z', 'updated_at': '2026-01-01T00:00:00Z'}]

    monkeypatch.setattr(patient_api, 'ensure_general_history', fake_ensure_general_history)
    monkeypatch.setattr(patient_api, 'list_patient_histories', fake_list_patient_histories)

    client = build_client()
    response = client.get(f'{settings.API_V1_STR}/patient/histories')

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]['id'] == 'hist-1'


def test_upload_rejects_file_over_30mb():
    client = build_client()
    content = b'x' * (30 * 1024 * 1024 + 1)
    response = client.post(
        f'{settings.API_V1_STR}/patient/files/upload',
        files={'uploaded_file': ('heavy.dcm', content, 'application/dicom')},
    )

    assert response.status_code == 413
    assert '30MB' in response.json()['detail']


def test_get_file_content_ok(monkeypatch):
    async def fake_get_patient_file(db, file_id, patient_user_id):
        assert file_id == 'abc123'
        assert patient_user_id == 101
        return {
            'appwrite_file_id': 'appwrite-file-1',
            'content_type': 'application/pdf',
            'original_name': 'resumen.pdf',
        }

    class DummyStorage:
        def download_file(self, file_id):
            assert file_id == 'appwrite-file-1'
            return b'PDF'

    monkeypatch.setattr(patient_api, 'get_patient_file', fake_get_patient_file)
    monkeypatch.setattr(patient_api, 'AppwriteStorageService', DummyStorage)

    client = build_client()
    response = client.get(f'{settings.API_V1_STR}/patient/files/abc123/content')

    assert response.status_code == 200
    assert response.content == b'PDF'
    assert response.headers['content-type'].startswith('application/pdf')

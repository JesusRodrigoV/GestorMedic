from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import doctor as doctor_api
from app.api.deps import CurrentUser, require_doctor
from app.core.config import settings
from app.db.mongo import get_mongo_db
from app.db.postgres import get_db


async def _doctor_user_override() -> CurrentUser:
    return CurrentUser(
        id=77,
        email='doctor@test.com',
        username='Dr Test',
        role_name='medico',
        doctor_profile_id=15,
    )


async def _doctor_without_profile_override() -> CurrentUser:
    return CurrentUser(
        id=77,
        email='doctor@test.com',
        username='Dr Test',
        role_name='medico',
        doctor_profile_id=None,
    )


def build_client(doctor_override=_doctor_user_override) -> TestClient:
    app = FastAPI()
    app.include_router(doctor_api.router, prefix=settings.API_V1_STR)
    app.dependency_overrides[require_doctor] = doctor_override
    app.dependency_overrides[get_mongo_db] = lambda: SimpleNamespace(
        medical_histories=SimpleNamespace(find_one=lambda *_args, **_kwargs: None)
    )
    app.dependency_overrides[get_db] = lambda: SimpleNamespace()
    return TestClient(app)


def test_doctor_files_requires_profile():
    client = build_client(doctor_override=_doctor_without_profile_override)
    response = client.get(f'{settings.API_V1_STR}/doctor/patients/101/files')

    assert response.status_code == 404
    assert response.json()['detail'] == 'Perfil medico no encontrado'


def test_list_patient_files_ok(monkeypatch):
    async def fake_assert_access(db, doctor_profile_id, patient_user_id):
        assert doctor_profile_id == 15
        assert patient_user_id == 101

    async def fake_list_patient_files(db, patient_user_id):
        return [
            {
                'id': 'f1',
                'patient_user_id': patient_user_id,
                'original_name': 'rx.pdf',
                'content_type': 'application/pdf',
                'extension': 'pdf',
                'size_bytes': 123,
                'uploaded_at': '2026-01-01T00:00:00Z',
                'appwrite_file_id': 'af-1',
                'appwrite_bucket_id': 'patient-files',
            }
        ]

    monkeypatch.setattr(doctor_api, '_assert_doctor_has_patient_access', fake_assert_access)
    monkeypatch.setattr(doctor_api, 'list_patient_files', fake_list_patient_files)

    client = build_client()
    response = client.get(f'{settings.API_V1_STR}/doctor/patients/101/files')

    assert response.status_code == 200
    rows = response.json()
    assert len(rows) == 1
    assert rows[0]['id'] == 'f1'


def test_patch_entry_expired(monkeypatch):
    async def fake_patch_doctor_entry(*_args, **_kwargs):
        return {'expired': True}

    monkeypatch.setattr(doctor_api, 'patch_doctor_entry', fake_patch_doctor_entry)

    client = build_client()
    response = client.patch(
        f'{settings.API_V1_STR}/doctor/histories/entries/entry-1',
        json={'notes': 'actualizacion'},
    )

    assert response.status_code == 409
    assert 'ventana de 3 dias' in response.json()['detail']

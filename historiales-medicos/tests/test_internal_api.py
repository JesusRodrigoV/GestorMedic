from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import internal as internal_api
from app.api.deps import require_internal_key
from app.core.config import settings
from app.db.mongo import get_mongo_db


def build_client() -> TestClient:
    app = FastAPI()
    app.include_router(internal_api.router, prefix=settings.API_V1_STR)
    app.dependency_overrides[require_internal_key] = lambda: None
    app.dependency_overrides[get_mongo_db] = lambda: SimpleNamespace()
    return TestClient(app)


def test_internal_patient_bootstrap_ok(monkeypatch):
    called = {'ok': False}

    async def fake_ensure_general_history(db, patient_user_id):
        called['ok'] = True
        assert patient_user_id == 301

    monkeypatch.setattr(internal_api, 'ensure_general_history', fake_ensure_general_history)

    client = build_client()
    response = client.post(
        f'{settings.API_V1_STR}/internal/patients/bootstrap',
        headers={'x-internal-key': 'test-internal-key'},
        json={'patient_user_id': 301},
    )

    assert response.status_code == 200
    assert response.json()['ok'] is True
    assert called['ok'] is True


def test_internal_appointment_bootstrap_ok(monkeypatch):
    calls = {'general': 0, 'appointment': 0}

    async def fake_ensure_general_history(db, patient_user_id):
        calls['general'] += 1
        assert patient_user_id == 301

    async def fake_ensure_history_from_appointment(
        db,
        *,
        patient_user_id,
        doctor_profile_id,
        doctor_name,
        specialty_id,
        specialty_name,
    ):
        calls['appointment'] += 1
        assert patient_user_id == 301
        assert doctor_profile_id == 55
        assert doctor_name is None
        assert specialty_id == 4
        assert specialty_name == 'Cardiologia'

    monkeypatch.setattr(internal_api, 'ensure_general_history', fake_ensure_general_history)
    monkeypatch.setattr(internal_api, 'ensure_history_from_appointment', fake_ensure_history_from_appointment)

    client = build_client()
    response = client.post(
        f'{settings.API_V1_STR}/internal/appointments/bootstrap',
        headers={'x-internal-key': 'test-internal-key'},
        json={
            'appointment_id': 99,
            'patient_user_id': 301,
            'doctor_profile_id': 55,
            'specialty_id': 4,
            'specialty_name': 'Cardiologia',
        },
    )

    assert response.status_code == 200
    assert response.json()['ok'] is True
    assert calls['general'] == 1
    assert calls['appointment'] == 1

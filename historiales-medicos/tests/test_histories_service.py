from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.services import histories_service


@pytest.mark.asyncio
async def test_ensure_general_history_uses_general_key():
    db = SimpleNamespace(medical_histories=SimpleNamespace(update_one=AsyncMock()))

    await histories_service.ensure_general_history(db, 222)

    db.medical_histories.update_one.assert_awaited_once()
    args, kwargs = db.medical_histories.update_one.await_args
    assert args[0] == {'patient_user_id': 222, 'history_key': 'general'}
    assert kwargs['upsert'] is True


@pytest.mark.asyncio
async def test_patch_doctor_entry_forbidden_when_other_doctor():
    entry_id = '6648d1a5e3dbf4d42c31c001'
    db = SimpleNamespace(
        medical_history_entries=SimpleNamespace(
            find_one=AsyncMock(
                return_value={
                    '_id': object(),
                    'doctor_profile_id': 77,
                    'editable_until': histories_service._utcnow(),
                    'history_id': object(),
                    'appointment_id': 1,
                    'patient_user_id': 2,
                    'specialty_id': 3,
                    'specialty_name': 'Medicina General',
                    'section_title': 'Nota',
                    'created_at': histories_service._utcnow(),
                }
            ),
            find_one_and_update=AsyncMock(),
        )
    )

    result = await histories_service.patch_doctor_entry(
        db,
        entry_id=entry_id,
        doctor_profile_id=15,
        section_title='Nueva',
        notes='x',
        checklist=None,
        structured_fields=None,
    )

    assert result == {'forbidden': True}


@pytest.mark.asyncio
async def test_patch_doctor_entry_expired_window():
    entry_id = '6648d1a5e3dbf4d42c31c001'
    db = SimpleNamespace(
        medical_history_entries=SimpleNamespace(
            find_one=AsyncMock(
                return_value={
                    '_id': object(),
                    'doctor_profile_id': 15,
                    'editable_until': histories_service._utcnow().replace(year=2020),
                    'history_id': object(),
                    'appointment_id': 1,
                    'patient_user_id': 2,
                    'specialty_id': 3,
                    'specialty_name': 'Medicina General',
                    'section_title': 'Nota',
                    'created_at': histories_service._utcnow(),
                }
            ),
            find_one_and_update=AsyncMock(),
        )
    )

    result = await histories_service.patch_doctor_entry(
        db,
        entry_id=entry_id,
        doctor_profile_id=15,
        section_title='Nueva',
        notes='x',
        checklist=None,
        structured_fields=None,
    )

    assert result == {'expired': True}

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.services import files_service


@pytest.mark.asyncio
async def test_save_file_metadata_builds_expected_document():
    insert_one = AsyncMock(return_value=SimpleNamespace(inserted_id='abc'))
    db = SimpleNamespace(patient_files=SimpleNamespace(insert_one=insert_one))

    result = await files_service.save_file_metadata(
        db,
        patient_user_id=10,
        appwrite_file_id='aw-1',
        appwrite_bucket_id='patient-files',
        original_name='study.DCM',
        content_type='application/dicom',
        size_bytes=2048,
    )

    assert result['id'] == 'abc'
    assert result['patient_user_id'] == 10
    assert result['extension'] == 'dcm'
    assert result['appwrite_file_id'] == 'aw-1'


@pytest.mark.asyncio
async def test_get_patient_file_invalid_id_returns_none():
    db = SimpleNamespace(patient_files=SimpleNamespace(find_one=AsyncMock()))

    result = await files_service.get_patient_file(db, 'not-an-object-id', 10)

    assert result is None


@pytest.mark.asyncio
async def test_delete_patient_file_invalid_id_returns_none():
    db = SimpleNamespace(patient_files=SimpleNamespace(find_one_and_delete=AsyncMock()))

    result = await files_service.delete_patient_file(db, 'bad-id', 99)

    assert result is None

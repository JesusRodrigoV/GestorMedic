from datetime import datetime, timedelta, timezone

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _history_projection(doc: dict) -> dict:
    return {
        'id': str(doc['_id']),
        'patient_user_id': doc['patient_user_id'],
        'history_key': doc['history_key'],
        'specialty_id': doc.get('specialty_id'),
        'specialty_name': doc['specialty_name'],
        'doctor_profile_id': doc.get('doctor_profile_id'),
        'doctor_name': doc.get('doctor_name'),
        'basic_fields': doc.get('basic_fields', {}),
        'created_at': doc['created_at'],
        'updated_at': doc['updated_at'],
    }


def _entry_projection(doc: dict) -> dict:
    return {
        'id': str(doc['_id']),
        'history_id': str(doc['history_id']),
        'appointment_id': doc['appointment_id'],
        'patient_user_id': doc['patient_user_id'],
        'doctor_profile_id': doc['doctor_profile_id'],
        'specialty_id': doc['specialty_id'],
        'specialty_name': doc['specialty_name'],
        'section_title': doc['section_title'],
        'notes': doc.get('notes'),
        'checklist': doc.get('checklist', []),
        'structured_fields': doc.get('structured_fields', {}),
        'created_at': doc['created_at'],
        'editable_until': doc['editable_until'],
    }


async def ensure_indexes(db: AsyncIOMotorDatabase):
    await db.medical_histories.create_index([('patient_user_id', 1), ('history_key', 1)], unique=True)
    await db.medical_histories.create_index([('patient_user_id', 1), ('updated_at', -1)])
    await db.medical_history_entries.create_index([('history_id', 1), ('created_at', -1)])
    await db.medical_history_entries.create_index([('patient_user_id', 1), ('created_at', -1)])
    await db.medical_history_entries.create_index([('doctor_profile_id', 1), ('editable_until', -1)])
    await db.patient_files.create_index([('patient_user_id', 1), ('uploaded_at', -1)])


async def ensure_general_history(db: AsyncIOMotorDatabase, patient_user_id: int):
    now = _utcnow()
    await db.medical_histories.update_one(
        {'patient_user_id': patient_user_id, 'history_key': 'general'},
        {
            '$setOnInsert': {
                'patient_user_id': patient_user_id,
                'history_key': 'general',
                'specialty_id': None,
                'specialty_name': 'Medicina General',
                'doctor_profile_id': None,
                'doctor_name': None,
                'basic_fields': {
                    'blood_type': None,
                    'allergies': [],
                    'chronic_conditions': [],
                    'current_medications': [],
                    'emergency_contact_name': None,
                    'emergency_contact_phone': None,
                    'notes': None,
                },
                'created_at': now,
                'updated_at': now,
            }
        },
        upsert=True,
    )


async def ensure_history_from_appointment(
    db: AsyncIOMotorDatabase,
    *,
    patient_user_id: int,
    doctor_profile_id: int,
    doctor_name: str | None,
    specialty_id: int,
    specialty_name: str,
):
    now = _utcnow()
    history_key = f'specialty:{specialty_id}:doctor:{doctor_profile_id}'
    await db.medical_histories.update_one(
        {'patient_user_id': patient_user_id, 'history_key': history_key},
        {
            '$setOnInsert': {
                'patient_user_id': patient_user_id,
                'history_key': history_key,
                'specialty_id': specialty_id,
                'specialty_name': specialty_name,
                'doctor_profile_id': doctor_profile_id,
                'doctor_name': doctor_name,
                'basic_fields': {},
                'created_at': now,
                'updated_at': now,
            }
        },
        upsert=True,
    )


async def list_patient_histories(db: AsyncIOMotorDatabase, patient_user_id: int) -> list[dict]:
    rows = db.medical_histories.find({'patient_user_id': patient_user_id}).sort('updated_at', -1)
    return [_history_projection(doc) async for doc in rows]


async def get_history(db: AsyncIOMotorDatabase, history_id: str, patient_user_id: int) -> dict | None:
    try:
        object_id = ObjectId(history_id)
    except InvalidId:
        return None
    doc = await db.medical_histories.find_one({'_id': object_id, 'patient_user_id': patient_user_id})
    return _history_projection(doc) if doc else None


async def patch_basic_fields(db: AsyncIOMotorDatabase, history_id: str, patient_user_id: int, fields: dict) -> dict | None:
    now = _utcnow()
    try:
        object_id = ObjectId(history_id)
    except InvalidId:
        return None
    result = await db.medical_histories.find_one_and_update(
        {'_id': object_id, 'patient_user_id': patient_user_id},
        {'$set': {'basic_fields': fields, 'updated_at': now}},
        return_document=True,
    )
    return _history_projection(result) if result else None


async def add_consultation_entry(
    db: AsyncIOMotorDatabase,
    *,
    history_id: str,
    appointment_id: int,
    patient_user_id: int,
    doctor_profile_id: int,
    specialty_id: int,
    specialty_name: str,
    section_title: str,
    notes: str | None,
    checklist: list[dict],
    structured_fields: dict,
    editable_days: int,
) -> dict:
    now = _utcnow()
    editable_until = now + timedelta(days=editable_days)
    history_object_id = ObjectId(history_id)
    doc = {
        'history_id': history_object_id,
        'appointment_id': appointment_id,
        'patient_user_id': patient_user_id,
        'doctor_profile_id': doctor_profile_id,
        'specialty_id': specialty_id,
        'specialty_name': specialty_name,
        'section_title': section_title,
        'notes': notes,
        'checklist': checklist,
        'structured_fields': structured_fields,
        'created_at': now,
        'editable_until': editable_until,
    }
    insert = await db.medical_history_entries.insert_one(doc)
    await db.medical_histories.update_one({'_id': history_object_id}, {'$set': {'updated_at': now}})
    doc['_id'] = insert.inserted_id
    return _entry_projection(doc)


async def list_history_entries(db: AsyncIOMotorDatabase, history_id: str, patient_user_id: int) -> list[dict]:
    try:
        history_object_id = ObjectId(history_id)
    except InvalidId:
        return []
    rows = db.medical_history_entries.find(
        {'history_id': history_object_id, 'patient_user_id': patient_user_id}
    ).sort('created_at', -1)
    return [_entry_projection(doc) async for doc in rows]


async def list_doctor_editable_entries(db: AsyncIOMotorDatabase, doctor_profile_id: int) -> list[dict]:
    now = _utcnow()
    rows = db.medical_history_entries.find(
        {
            'doctor_profile_id': doctor_profile_id,
            'editable_until': {'$gte': now},
        }
    ).sort('editable_until', 1)
    return [_entry_projection(doc) async for doc in rows]


async def patch_doctor_entry(
    db: AsyncIOMotorDatabase,
    *,
    entry_id: str,
    doctor_profile_id: int,
    section_title: str | None,
    notes: str | None,
    checklist: list[dict] | None,
    structured_fields: dict | None,
) -> dict | None:
    now = _utcnow()
    try:
        entry_object_id = ObjectId(entry_id)
    except InvalidId:
        return None

    existing = await db.medical_history_entries.find_one({'_id': entry_object_id})
    if not existing:
        return None
    if existing['doctor_profile_id'] != doctor_profile_id:
        return {'forbidden': True}
    if existing['editable_until'] < now:
        return {'expired': True}

    patch: dict = {}
    if section_title is not None:
        patch['section_title'] = section_title
    if notes is not None:
        patch['notes'] = notes
    if checklist is not None:
        patch['checklist'] = checklist
    if structured_fields is not None:
        patch['structured_fields'] = structured_fields

    if not patch:
        return _entry_projection(existing)

    updated = await db.medical_history_entries.find_one_and_update(
        {'_id': entry_object_id},
        {'$set': patch},
        return_document=True,
    )
    return _entry_projection(updated)

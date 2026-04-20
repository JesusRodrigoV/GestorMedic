from collections import defaultdict
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_doctor
from app.db.session import get_db
from app.models.appointments import Appointment, SlotOverride, WeeklyAgendaBlock
from app.models.external import DoctorProfile, Room, Specialty, User
from app.schemas.common import CalendarSlotPatchIn, WeeklyBlockIn, WeeklyBlockOut
from app.services.scheduling import (
    generate_slots_for_doctor,
    validate_block_permissions,
    validate_weekly_blocks,
)


router = APIRouter(prefix='/doctor', tags=['Doctor'])


def ensure_doctor_profile(current_user: CurrentUser) -> int:
    if not current_user.doctor_profile_id:
        raise HTTPException(status_code=404, detail='Perfil medico no encontrado')
    return current_user.doctor_profile_id


@router.get('/agenda/weekly', response_model=list[WeeklyBlockOut])
async def get_weekly_agenda(
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    doctor_id = ensure_doctor_profile(current_user)
    rows = (
        await db.execute(
            select(WeeklyAgendaBlock)
            .where(WeeklyAgendaBlock.doctor_id == doctor_id, WeeklyAgendaBlock.is_active.is_(True))
            .order_by(WeeklyAgendaBlock.weekday, WeeklyAgendaBlock.start_time)
        )
    ).scalars().all()
    return [
        WeeklyBlockOut(
            id=row.id,
            weekday=row.weekday,
            start_time=row.start_time,
            end_time=row.end_time,
            consultation_minutes=row.consultation_minutes,
            specialty_id=row.specialty_id,
            room_id=row.room_id,
            consultation_price=row.consultation_price,
        )
        for row in rows
    ]


@router.put('/agenda/weekly', response_model=list[WeeklyBlockOut])
async def save_weekly_agenda(
    payload: list[WeeklyBlockIn],
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    doctor_id = ensure_doctor_profile(current_user)
    block_data = [item.model_dump() for item in payload]

    await validate_weekly_blocks(block_data)
    for block in block_data:
        await validate_block_permissions(db, current_user.clinic_id, doctor_id, block)

    await db.execute(delete(WeeklyAgendaBlock).where(WeeklyAgendaBlock.doctor_id == doctor_id))
    for block in block_data:
        db.add(WeeklyAgendaBlock(doctor_id=doctor_id, **block))
    await db.flush()

    return await get_weekly_agenda(current_user=current_user, db=db)


@router.get('/agenda/calendar')
async def get_calendar_slots(
    date_from: date,
    date_to: date,
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    doctor_id = ensure_doctor_profile(current_user)
    slots = await generate_slots_for_doctor(db, doctor_id=doctor_id, date_from=date_from, date_to=date_to)
    grouped: dict[date, list] = defaultdict(list)
    for slot in slots:
        grouped[slot['starts_at'].date()].append(slot)
    return [
        {
            'day': day,
            'slots': items,
        }
        for day, items in sorted(grouped.items())
    ]


@router.patch('/agenda/slots/{slot_start_iso}')
async def patch_single_slot(
    slot_start_iso: str,
    payload: CalendarSlotPatchIn,
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    doctor_id = ensure_doctor_profile(current_user)
    slot_start = datetime.fromisoformat(slot_start_iso)

    block_payload = {
        'weekday': slot_start.weekday(),
        'start_time': slot_start.time(),
        'end_time': payload.slot_end.time(),
        'consultation_minutes': int((payload.slot_end - slot_start).total_seconds() / 60),
        'specialty_id': payload.specialty_id,
        'room_id': payload.room_id,
        'consultation_price': payload.consultation_price,
    }
    await validate_block_permissions(db, current_user.clinic_id, doctor_id, block_payload)

    existing = (
        await db.execute(
            select(SlotOverride).where(
                SlotOverride.doctor_id == doctor_id,
                SlotOverride.slot_start == slot_start,
            )
        )
    ).scalar_one_or_none()

    if existing:
        existing.slot_end = payload.slot_end
        existing.specialty_id = payload.specialty_id
        existing.room_id = payload.room_id
        existing.consultation_price = payload.consultation_price
        existing.extra_description = payload.extra_description
        existing.is_blocked = payload.is_blocked
    else:
        db.add(
            SlotOverride(
                doctor_id=doctor_id,
                slot_start=slot_start,
                slot_end=payload.slot_end,
                specialty_id=payload.specialty_id,
                room_id=payload.room_id,
                consultation_price=payload.consultation_price,
                extra_description=payload.extra_description,
                is_blocked=payload.is_blocked,
            )
        )

    return {'ok': True}


@router.get('/appointments/day')
async def appointments_by_day(
    day: date,
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    doctor_id = ensure_doctor_profile(current_user)
    print(f"DEBUG: Fetching appointments for doctor_id={doctor_id} on day={day}")

    day_start = datetime.combine(day, datetime.min.time())
    day_end = datetime.combine(day, datetime.max.time())
    
    print(f"DEBUG: Filtering from {day_start} to {day_end}")

    stmt = (
        select(
            Appointment, 
            User.username.label('patient_name'), 
            Specialty.name.label('specialty_name'), 
            Room.name.label('room_name')
        )
        .outerjoin(User, User.id == Appointment.patient_user_id)
        .outerjoin(Specialty, Specialty.id == Appointment.specialty_id)
        .outerjoin(Room, Room.id == Appointment.room_id)
        .where(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.starts_at >= day_start,
                Appointment.starts_at <= day_end,
            )
        )
        .order_by(Appointment.starts_at)
    )
    
    rows = (await db.execute(stmt)).all()
    print(f"DEBUG: Found {len(rows)} appointments")

    doctor_name = (
        await db.execute(
            select(User.username).join(DoctorProfile, DoctorProfile.user_id == User.id).where(DoctorProfile.id == doctor_id)
        )
    ).scalar_one_or_none() or current_user.username

    return [
        {
            'id': row.Appointment.id,
            'doctor_id': doctor_id,
            'doctor_name': doctor_name,
            'patient_user_id': row.Appointment.patient_user_id,
            'patient_name': row.patient_name or 'Paciente Desconocido',
            'specialty_name': row.specialty_name or 'General',
            'room_name': row.room_name or 'N/A',
            'starts_at': row.Appointment.starts_at,
            'ends_at': row.Appointment.ends_at,
            'status': row.Appointment.status.value,
            'extra_notes': row.Appointment.extra_notes,
        }
        for row in rows
    ]

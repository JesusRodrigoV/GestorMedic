from collections import defaultdict
from datetime import date, datetime, time, timedelta

from fastapi import HTTPException, status
from sqlalchemy import and_, select, cast, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointments import (
    Appointment,
    RoomDoctorPermission,
    RoomSpecialtyPermission,
    SlotOverride,
    WeeklyAgendaBlock,
)
from app.models.enums import AppointmentStatus
from app.models.external import (
    ClinicDoctor,
    DoctorProfile,
    DoctorSpecialty,
    Room,
    Specialty,
    User,
)


def overlaps(a_start: time, a_end: time, b_start: time, b_end: time) -> bool:
    return a_start < b_end and b_start < a_end


async def validate_weekly_blocks(blocks: list[dict]) -> None:
    day_buckets: dict[int, list[dict]] = defaultdict(list)
    for block in blocks:
        if block['start_time'] >= block['end_time']:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail='La hora de inicio debe ser menor que la hora de fin',
            )
        day_buckets[block['weekday']].append(block)

    for day, day_blocks in day_buckets.items():
        sorted_blocks = sorted(day_blocks, key=lambda item: item['start_time'])
        for i in range(len(sorted_blocks) - 1):
            current = sorted_blocks[i]
            nxt = sorted_blocks[i + 1]
            if overlaps(current['start_time'], current['end_time'], nxt['start_time'], nxt['end_time']):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f'Solapamiento detectado para el dia {day}',
                )


async def doctor_belongs_to_clinic(db: AsyncSession, doctor_id: int, clinic_id: int | None) -> bool:
    if clinic_id is None:
        return False
    stmt = select(ClinicDoctor).where(
        ClinicDoctor.doctor_id == doctor_id,
        ClinicDoctor.clinic_id == clinic_id,
        ClinicDoctor.is_active.is_(True),
    )
    return (await db.execute(stmt)).scalar_one_or_none() is not None


async def validate_block_permissions(
    db: AsyncSession,
    clinic_id: int | None,
    doctor_id: int,
    block: dict,
) -> None:
    room = (await db.execute(select(Room).where(Room.id == block['room_id'], Room.is_active.is_(True)))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail='Consultorio no encontrado o inactivo')
    if clinic_id and room.clinic_id != clinic_id:
        raise HTTPException(status_code=403, detail='El consultorio no pertenece a tu clinica')

    doctor_exists = (await db.execute(select(DoctorProfile.id).where(DoctorProfile.id == doctor_id))).scalar_one_or_none()
    if not doctor_exists:
        raise HTTPException(status_code=404, detail='Doctor no encontrado')

    if clinic_id and not await doctor_belongs_to_clinic(db, doctor_id, clinic_id):
        raise HTTPException(status_code=403, detail='Doctor no pertenece a la clinica')

    specialty_ok = (
        await db.execute(
            select(DoctorSpecialty).where(
                DoctorSpecialty.doctor_id == doctor_id,
                DoctorSpecialty.specialty_id == block['specialty_id'],
            )
        )
    ).scalar_one_or_none()
    if not specialty_ok:
        raise HTTPException(status_code=422, detail='Especialidad no asignada al doctor')

    room_specialty_ok = (
        await db.execute(
            select(RoomSpecialtyPermission).where(
                RoomSpecialtyPermission.room_id == block['room_id'],
                RoomSpecialtyPermission.specialty_id == block['specialty_id'],
                RoomSpecialtyPermission.is_active.is_(True),
            )
        )
    ).scalar_one_or_none()
    if not room_specialty_ok:
        raise HTTPException(status_code=422, detail='Especialidad no permitida en el consultorio')

    doctor_room_ok = (
        await db.execute(
            select(RoomDoctorPermission).where(
                RoomDoctorPermission.room_id == block['room_id'],
                RoomDoctorPermission.doctor_id == doctor_id,
                RoomDoctorPermission.weekday == block['weekday'],
                RoomDoctorPermission.is_active.is_(True),
                RoomDoctorPermission.start_time <= block['start_time'],
                RoomDoctorPermission.end_time >= block['end_time'],
            )
        )
    ).scalar_one_or_none()
    if not doctor_room_ok:
        raise HTTPException(
            status_code=422,
            detail='El doctor no tiene permiso de uso de consultorio para ese horario',
        )


async def list_doctors(
    db: AsyncSession,
    clinic_id: int | None,
    q: str | None,
    specialty_id: int | None,
    page: int,
    page_size: int,
):
    stmt = (
        select(
            DoctorProfile.id.label('doctor_id'),
            User.id.label('user_id'),
            User.username,
            User.email,
            DoctorProfile.bio,
            DoctorProfile.experience_years,
            DoctorProfile.photo_url,
            Specialty.name.label('specialty_name'),
        )
        .join(User, User.id == DoctorProfile.user_id)
        .outerjoin(DoctorSpecialty, DoctorSpecialty.doctor_id == DoctorProfile.id)
        .outerjoin(Specialty, Specialty.id == DoctorSpecialty.specialty_id)
    )

    if clinic_id:
        stmt = stmt.join(
            ClinicDoctor,
            and_(ClinicDoctor.doctor_id == DoctorProfile.id, ClinicDoctor.clinic_id == clinic_id),
        )

    if q:
        like = f'%{q.lower()}%'
        stmt = stmt.where((User.username.ilike(like)) | (User.email.ilike(like)) | (Specialty.name.ilike(like)))

    if specialty_id:
        stmt = stmt.where(Specialty.id == specialty_id)

    rows = (await db.execute(stmt)).all()
    doctor_map: dict[int, dict] = {}
    for row in rows:
        if row.doctor_id not in doctor_map:
            doctor_map[row.doctor_id] = {
                'doctor_id': row.doctor_id,
                'user_id': row.user_id,
                'doctor_name': row.username,
                'email': row.email,
                'bio': row.bio,
                'experience_years': row.experience_years,
                'photo_url': row.photo_url,
                'specialties': [],
            }
        if row.specialty_name and row.specialty_name not in doctor_map[row.doctor_id]['specialties']:
            doctor_map[row.doctor_id]['specialties'].append(row.specialty_name)

    doctors = list(doctor_map.values())
    total = len(doctors)
    start = (page - 1) * page_size
    end = start + page_size
    return {'items': doctors[start:end], 'meta': {'total': total, 'page': page, 'pageSize': page_size}}


async def generate_slots_for_doctor(
    db: AsyncSession,
    doctor_id: int,
    date_from: date,
    date_to: date,
):
    block_rows = (
        await db.execute(
            select(
                WeeklyAgendaBlock.id,
                WeeklyAgendaBlock.weekday,
                WeeklyAgendaBlock.start_time,
                WeeklyAgendaBlock.end_time,
                WeeklyAgendaBlock.consultation_minutes,
                WeeklyAgendaBlock.specialty_id,
                WeeklyAgendaBlock.room_id,
                WeeklyAgendaBlock.consultation_price,
                Specialty.name.label('specialty_name'),
                Room.name.label('room_name'),
            )
            .join(Specialty, Specialty.id == WeeklyAgendaBlock.specialty_id)
            .join(Room, Room.id == WeeklyAgendaBlock.room_id)
            .where(WeeklyAgendaBlock.doctor_id == doctor_id, WeeklyAgendaBlock.is_active.is_(True))
        )
    ).all()

    if not block_rows:
        return []

    override_rows = (
        await db.execute(
            select(SlotOverride).where(
                SlotOverride.doctor_id == doctor_id,
                SlotOverride.slot_start >= datetime.combine(date_from, time.min),
                SlotOverride.slot_start <= datetime.combine(date_to, time.max),
            )
        )
    ).scalars().all()
    override_map = {row.slot_start: row for row in override_rows}

    booked_rows = (
        await db.execute(
            select(Appointment.doctor_id, Appointment.starts_at)
            .where(
                Appointment.doctor_id == doctor_id,
                Appointment.starts_at >= datetime.combine(date_from, time.min),
                Appointment.starts_at <= datetime.combine(date_to, time.max),
                cast(Appointment.status, String).in_([AppointmentStatus.CONFIRMED.value, AppointmentStatus.PENDING.value]),
            )
        )
    ).all()
    booked_set = {row.starts_at for row in booked_rows}

    cursor_day = date_from
    output: list[dict] = []
    while cursor_day <= date_to:
        weekday = cursor_day.weekday()
        blocks = [row for row in block_rows if row.weekday == weekday]
        for block in blocks:
            start_dt = datetime.combine(cursor_day, block.start_time)
            end_dt = datetime.combine(cursor_day, block.end_time)
            step = timedelta(minutes=block.consultation_minutes)
            slot_start = start_dt
            while slot_start + step <= end_dt:
                slot_end = slot_start + step
                specialty_id = block.specialty_id
                specialty_name = block.specialty_name
                room_id = block.room_id
                room_name = block.room_name
                price = block.consultation_price
                is_blocked = False

                override = override_map.get(slot_start)
                if override:
                    slot_end = override.slot_end
                    specialty_id = override.specialty_id
                    room_id = override.room_id
                    price = override.consultation_price
                    is_blocked = override.is_blocked
                    spec_row = (
                        await db.execute(select(Specialty.name).where(Specialty.id == specialty_id))
                    ).scalar_one_or_none()
                    room_row = (await db.execute(select(Room.name).where(Room.id == room_id))).scalar_one_or_none()
                    specialty_name = spec_row or specialty_name
                    room_name = room_row or room_name

                # Un slot solo esta disponible si:
                # 1. No esta reservado (booked_set)
                # 2. No esta bloqueado manualmente (is_blocked)
                # 3. NO esta en el pasado (comparado con el tiempo real actual)
                is_in_past = slot_start < datetime.now()
                
                output.append(
                    {
                        'doctor_id': doctor_id,
                        'starts_at': slot_start,
                        'ends_at': slot_end,
                        'specialty_id': specialty_id,
                        'specialty_name': specialty_name,
                        'room_id': room_id,
                        'room_name': room_name,
                        'consultation_price': price,
                        'is_available': (slot_start not in booked_set) and (not is_blocked) and (not is_in_past),
                    }
                )
                slot_start = slot_start + step
        cursor_day = cursor_day + timedelta(days=1)
    return output

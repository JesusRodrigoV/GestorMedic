from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_patient
from app.db.session import get_db
from app.models.appointments import Appointment
from app.models.enums import AppointmentStatus
from app.models.external import DoctorProfile, Room, Specialty, User
from app.schemas.common import AppointmentOut, ReserveAppointmentIn
from app.services.scheduling import generate_slots_for_doctor
from app.services.histories_client import bootstrap_appointment_history


router = APIRouter(prefix='/patient', tags=['Patient'])


@router.get('/appointments/my', response_model=list[AppointmentOut])
async def my_appointments(
    status_filter: AppointmentStatus | None = Query(default=None, alias='status'),
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            Appointment,
            User.username.label('doctor_name'),
            Specialty.name.label('specialty_name'),
            Room.name.label('room_name'),
        )
        .join(DoctorProfile, DoctorProfile.id == Appointment.doctor_id)
        .join(User, User.id == DoctorProfile.user_id)
        .join(Specialty, Specialty.id == Appointment.specialty_id)
        .join(Room, Room.id == Appointment.room_id)
        .where(Appointment.patient_user_id == current_user.id)
        .order_by(Appointment.starts_at.desc())
    )
    if status_filter:
        stmt = stmt.where(Appointment.status == status_filter)

    rows = (await db.execute(stmt)).all()
    return [
        AppointmentOut(
            id=row.Appointment.id,
            doctor_id=row.Appointment.doctor_id,
            doctor_name=row.doctor_name,
            patient_user_id=current_user.id,
            patient_name=current_user.username,
            specialty_name=row.specialty_name,
            room_name=row.room_name,
            starts_at=row.Appointment.starts_at,
            ends_at=row.Appointment.ends_at,
            status=row.Appointment.status.value,
            extra_notes=row.Appointment.extra_notes,
        )
        for row in rows
    ]


@router.post('/appointments/reserve', response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def reserve_appointment(
    payload: ReserveAppointmentIn,
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncSession = Depends(get_db),
):
    if payload.starts_at < payload.starts_at.now():
        raise HTTPException(status_code=422, detail='No se puede reservar una cita en el pasado')

    slots = await generate_slots_for_doctor(
        db,
        doctor_id=payload.doctor_id,
        date_from=payload.starts_at.date(),
        date_to=payload.starts_at.date() + timedelta(days=1),
    )
    slot = next((item for item in slots if item['starts_at'] == payload.starts_at), None)
    if not slot or not slot['is_available']:
        raise HTTPException(status_code=409, detail='El horario ya no esta disponible')

    existing = (
        await db.execute(
            select(Appointment.id).where(
                and_(
                    Appointment.doctor_id == payload.doctor_id,
                    Appointment.starts_at == payload.starts_at,
                    Appointment.status.in_([AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]),
                )
            )
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail='El horario ya fue reservado')

    appointment = Appointment(
        doctor_id=payload.doctor_id,
        patient_user_id=current_user.id,
        specialty_id=slot['specialty_id'],
        room_id=slot['room_id'],
        starts_at=slot['starts_at'],
        ends_at=slot['ends_at'],
        status=AppointmentStatus.CONFIRMED,
        extra_notes=payload.extra_notes,
    )
    db.add(appointment)
    await db.flush()

    await bootstrap_appointment_history(
        appointment_id=appointment.id,
        patient_user_id=current_user.id,
        doctor_profile_id=appointment.doctor_id,
        specialty_id=appointment.specialty_id,
        specialty_name=slot['specialty_name'],
    )

    doctor_name = (
        await db.execute(
            select(User.username)
            .join(DoctorProfile, DoctorProfile.user_id == User.id)
            .where(DoctorProfile.id == payload.doctor_id)
        )
    ).scalar_one_or_none() or 'Doctor'

    return AppointmentOut(
        id=appointment.id,
        doctor_id=appointment.doctor_id,
        doctor_name=doctor_name,
        patient_user_id=current_user.id,
        patient_name=current_user.username,
        specialty_name=slot['specialty_name'],
        room_name=slot['room_name'],
        starts_at=appointment.starts_at,
        ends_at=appointment.ends_at,
        status=appointment.status.value,
        extra_notes=appointment.extra_notes,
    )

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select, cast, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_patient
from app.db.session import get_db
from app.models.appointments import Appointment
from app.models.enums import AppointmentStatus
from app.models.external import DoctorProfile, Room, Specialty, User
from app.schemas.common import AppointmentOut, ReserveAppointmentIn
from app.services.scheduling import generate_slots_for_doctor
import os
import time
import httpx
from jose import jwt
import logging


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
        .outerjoin(DoctorProfile, DoctorProfile.id == Appointment.doctor_id)
        .outerjoin(User, User.id == DoctorProfile.user_id)
        .outerjoin(Specialty, Specialty.id == Appointment.specialty_id)
        .outerjoin(Room, Room.id == Appointment.room_id)
        .where(Appointment.patient_user_id == current_user.id)
        .order_by(Appointment.starts_at.desc())
    )
    if status_filter:
        stmt = stmt.where(cast(Appointment.status, String) == status_filter.value)

    result = await db.execute(stmt)
    rows = result.all()

    # Obtener calificaciones del microservicio de ranking
    ratings_map = {}
    try:
        async with httpx.AsyncClient() as client:
            # Pedimos los ratings del paciente
            ranking_url = "http://gm-ranking-api:8000/api/v1"
            # Nota: El microservicio de ranking no tiene un endpoint por paciente aún, 
            # pero podemos filtrar los ratings obtenidos si fuera necesario. 
            # Por ahora, como es una integración, intentaremos obtenerlos por doctor o simplemente manejar el error.
            # Para esta implementación, buscaremos en la tabla local por ahora para evitar latencia excesiva 
            # en este paso, o podrías implementar un caché.
            pass
    except Exception:
        pass

    # Para mayor simplicidad y velocidad en este paso, usaremos la tabla local de ratings si existe
    from app.models.reports import AppointmentRating
    rating_stmt = select(AppointmentRating).where(AppointmentRating.patient_user_id == current_user.id)
    rating_result = await db.execute(rating_stmt)
    local_ratings = {r.appointment_id: r.rating for r in rating_result.scalars().all()}
    
    return [
        AppointmentOut(
            id=row.Appointment.id,
            doctor_id=row.Appointment.doctor_id,
            doctor_name=row.doctor_name or 'Doctor Desconocido',
            patient_user_id=current_user.id,
            patient_name=current_user.username,
            specialty_name=row.specialty_name or 'General',
            room_name=row.room_name or 'N/A',
            starts_at=row.Appointment.starts_at,
            ends_at=row.Appointment.ends_at,
            status=row.Appointment.status.value,
            extra_notes=row.Appointment.extra_notes,
            rating=local_ratings.get(row.Appointment.id)
        )
        for row in rows
    ]


@router.post('/appointments/reserve', response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def reserve_appointment(
    payload: ReserveAppointmentIn,
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncSession = Depends(get_db),
):
    # VALIDACIÓN DE RED SOCIAL: Verificar conexión aceptada
    try:
        async with httpx.AsyncClient() as client:
            social_url = "http://gm-social-api:8000/api/v1/internal/check-connection"
            response = await client.get(f"{social_url}/{current_user.id}/{payload.doctor_id}")
            if response.status_code != 200:
                raise HTTPException(status_code=503, detail="Social service unavailable")
            
            conn_data = response.json()
            if not conn_data.get("is_connected"):
                raise HTTPException(
                    status_code=403, 
                    detail="Debes ser aceptado por este doctor en la red social antes de reservar una cita."
                )
    except httpx.RequestError:
         raise HTTPException(status_code=503, detail="Error connecting to social service")

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
                    cast(Appointment.status, String).in_([AppointmentStatus.CONFIRMED.value, AppointmentStatus.PENDING.value]),
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

    # AUDITORÍA: Registrar la reserva de la cita
    from app.services.audit import log_event
    await log_event(
        db=db,
        event="APPOINTMENT_RESERVED",
        user_id=current_user.id,
        clinic_id=current_user.clinic_id,
        details={
            "doctor_id": payload.doctor_id,
            "starts_at": slot['starts_at'].isoformat(),
            "specialty_name": slot['specialty_name'],
            "appointment_id": appointment.id
        }
    )

    doctor_name = (
        await db.execute(
            select(User.username)
            .join(DoctorProfile, DoctorProfile.user_id == User.id)
            .where(DoctorProfile.id == payload.doctor_id)
        )
    ).scalar_one_or_none() or 'Doctor'

    # Encolar notificación utilizando el despachador unificado
    from app.services.notifications import notification_dispatcher
    await notification_dispatcher.send_appointment_reminder(
        user_id=current_user.id,
        email=current_user.email,
        patient_name=current_user.username,
        specialty=slot['specialty_name'],
        starts_at=slot['starts_at']
    )

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

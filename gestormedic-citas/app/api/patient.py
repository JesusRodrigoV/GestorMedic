from datetime import date, timedelta, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select, cast, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import ProgrammingError

from app.api.deps import CurrentUser, require_patient
from app.db.session import get_db
from app.models.appointments import Appointment
from app.models.enums import AppointmentStatus
from app.models.external import DoctorProfile, Room, Specialty, User
from app.schemas.common import AppointmentOut, ReserveAppointmentIn
from app.services.scheduling import generate_slots_for_doctor
from app.services.histories_client import bootstrap_appointment_history
import os
import time
import httpx
from jose import jwt
import logging

router = APIRouter(prefix="/patient", tags=["Patient"])


@router.get("/appointments/my", response_model=list[AppointmentOut])
async def my_appointments(
    status_filter: AppointmentStatus | None = Query(default=None, alias="status"),
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            Appointment,
            User.username.label("doctor_name"),
            Specialty.name.label("specialty_name"),
            Room.name.label("room_name"),
        )
        .join(DoctorProfile, DoctorProfile.id == Appointment.doctor_id)
        .join(User, User.id == DoctorProfile.user_id)
        .outerjoin(Specialty, Specialty.id == Appointment.specialty_id)
        .outerjoin(Room, Room.id == Appointment.room_id)
        .where(Appointment.patient_user_id == current_user.id)
        .order_by(Appointment.starts_at.desc())
    )
    if status_filter:
        stmt = stmt.where(cast(Appointment.status, String) == status_filter.value)

    result = await db.execute(stmt)
    rows = result.all()

    ratings_map = {}
    try:
        async with httpx.AsyncClient() as client:
            ranking_url = "http://gm-ranking-api:8000/api/v1"
            pass
    except Exception:
        pass

    from app.models.reports import AppointmentRating

    try:
        rating_stmt = select(AppointmentRating).where(
            AppointmentRating.patient_user_id == current_user.id
        )
        rating_result = await db.execute(rating_stmt)
        local_ratings = {r.appointment_id: r.rating for r in rating_result.scalars().all()}
    except ProgrammingError:
        # Compatibilidad temporal cuando la migracion de ratings aun no fue aplicada.
        local_ratings = {}

    return [
        AppointmentOut(
            id=row.Appointment.id,
            doctor_id=row.Appointment.doctor_id,
            doctor_name=row.doctor_name or "Doctor Desconocido",
            patient_user_id=current_user.id,
            patient_name=current_user.username,
            specialty_name=row.specialty_name or "General",
            room_name=row.room_name or "N/A",
            starts_at=row.Appointment.starts_at,
            ends_at=row.Appointment.ends_at,
            status=row.Appointment.status.value,
            extra_notes=row.Appointment.extra_notes,
            rating=local_ratings.get(row.Appointment.id),
        )
        for row in rows
    ]


@router.post(
    "/appointments/reserve",
    response_model=AppointmentOut,
    status_code=status.HTTP_201_CREATED,
)
async def reserve_appointment(
    payload: ReserveAppointmentIn,
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncSession = Depends(get_db),
):
    # Flexibilizar la validación de fecha: permitir un margen de 10 minutos para evitar errores por sincronización de relojes
    # Forzamos a que ambas sean naive (sin zona horaria) para una comparación segura en este entorno
    now = datetime.now()
    appointment_time = payload.starts_at.replace(tzinfo=None) if payload.starts_at.tzinfo else payload.starts_at
    
    if appointment_time < (now - timedelta(minutes=10)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No se puede reservar una cita en el pasado"
        )

    slots = await generate_slots_for_doctor(
        db,
        doctor_id=payload.doctor_id,
        date_from=payload.starts_at.date(),
        date_to=payload.starts_at.date() + timedelta(days=1),
    )
    slot = next(
        (item for item in slots if item["starts_at"] == payload.starts_at), None
    )
    if not slot or not slot["is_available"]:
        raise HTTPException(status_code=409, detail="El horario ya no esta disponible")

    existing = (
        await db.execute(
            select(Appointment.id).where(
                and_(
                    Appointment.doctor_id == payload.doctor_id,
                    Appointment.starts_at == payload.starts_at,
                    cast(Appointment.status, String).in_(
                        [
                            AppointmentStatus.CONFIRMED.value,
                            AppointmentStatus.PENDING.value,
                        ]
                    ),
                )
            )
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="El horario ya fue reservado")

    appointment = Appointment(
        doctor_id=payload.doctor_id,
        patient_user_id=current_user.id,
        specialty_id=slot["specialty_id"],
        room_id=slot["room_id"],
        starts_at=slot["starts_at"],
        ends_at=slot["ends_at"],
        status=AppointmentStatus.CONFIRMED,
        extra_notes=payload.extra_notes,
    )
    db.add(appointment)
    await db.flush()

    # --- LOGICA DE INTEGRACION (SEGURA) ---
    try:
        # Integración de la Rama HEAD: Inicializar Historial
        await bootstrap_appointment_history(
            appointment_id=appointment.id,
            patient_user_id=current_user.id,
            doctor_profile_id=appointment.doctor_id,
            specialty_id=appointment.specialty_id,
            specialty_name=slot["specialty_name"],
        )
    except Exception as e:
        print(f"ALERTA: Fallo al inicializar historial: {e}")

    # Auditoria deshabilitada temporalmente para evitar fallos de claves foraneas con la tabla clinics
    # await log_event(...) 

    try:
        doctor_name = (
            await db.execute(
                select(User.username)
                .join(DoctorProfile, DoctorProfile.user_id == User.id)
                .where(DoctorProfile.id == payload.doctor_id)
            )
        ).scalar_one_or_none() or "Doctor"

        from app.services.notifications import notification_dispatcher
        await notification_dispatcher.send_appointment_reminder(
            user_id=current_user.id,
            email=current_user.email,
            patient_name=current_user.username,
            specialty=slot["specialty_name"],
            starts_at=slot["starts_at"],
        )
    except Exception as e:
        print(f"ALERTA: Fallo al enviar notificaciones: {e}")

    return AppointmentOut(
        id=appointment.id,
        doctor_id=appointment.doctor_id,
        doctor_name=doctor_name if 'doctor_name' in locals() else "Doctor",
        patient_user_id=current_user.id,
        patient_name=current_user.username,
        specialty_name=slot["specialty_name"],
        room_name=slot["room_name"],
        starts_at=appointment.starts_at,
        ends_at=appointment.ends_at,
        status=appointment.status.value,
        extra_notes=appointment.extra_notes,
    )

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_doctor, require_patient
from app.db.session import get_db
from app.models.appointments import Appointment
from app.models.reports import AppointmentReport, AppointmentRating
from app.models.enums import AppointmentStatus
from app.schemas.reports import (
    AppointmentReportIn,
    AppointmentReportOut,
    AppointmentRatingIn,
    AppointmentRatingOut,
)

router = APIRouter()


@router.post('/doctor/appointments/{appointment_id}/report', response_model=AppointmentReportOut)
async def post_report(
    appointment_id: int,
    payload: AppointmentReportIn,
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    doctor_id = current_user.doctor_profile_id
    if not doctor_id:
        raise HTTPException(status_code=404, detail='Perfil medico no encontrado')

    stmt = select(Appointment).where(Appointment.id == appointment_id, Appointment.doctor_id == doctor_id)
    appointment = (await db.execute(stmt)).scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail='Cita no encontrada')

    if appointment.status == AppointmentStatus.CANCELLED:
        raise HTTPException(status_code=422, detail='Cita cancelada')

    existing = (
        await db.execute(select(AppointmentReport).where(AppointmentReport.appointment_id == appointment_id))
    ).scalar_one_or_none()

    now = datetime.utcnow()
    if existing:
        existing.report_text = payload.report_text
        existing.diagnosis = payload.diagnosis
        existing.prescription = payload.prescription
        existing.follow_up = payload.follow_up
        existing.updated_at = now
        report = existing
    else:
        report = AppointmentReport(
            appointment_id=appointment_id,
            doctor_id=doctor_id,
            patient_user_id=appointment.patient_user_id,
            report_text=payload.report_text,
            diagnosis=payload.diagnosis,
            prescription=payload.prescription,
            follow_up=payload.follow_up,
            created_at=now,
        )
        db.add(report)

    appointment.status = AppointmentStatus.COMPLETED
    await db.flush()

    return AppointmentReportOut(
        id=report.id,
        appointment_id=report.appointment_id,
        doctor_id=report.doctor_id,
        patient_user_id=report.patient_user_id,
        report_text=report.report_text,
        diagnosis=report.diagnosis,
        prescription=report.prescription,
        follow_up=report.follow_up,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


@router.get('/patient/appointments/{appointment_id}/report', response_model=AppointmentReportOut)
async def get_report(
    appointment_id: int,
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Appointment).where(Appointment.id == appointment_id, Appointment.patient_user_id == current_user.id)
    appointment = (await db.execute(stmt)).scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail='Cita no encontrada')

    report = (
        await db.execute(select(AppointmentReport).where(AppointmentReport.appointment_id == appointment_id))
    ).scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail='Informe no encontrado')

    return AppointmentReportOut(
        id=report.id,
        appointment_id=report.appointment_id,
        doctor_id=report.doctor_id,
        patient_user_id=report.patient_user_id,
        report_text=report.report_text,
        diagnosis=report.diagnosis,
        prescription=report.prescription,
        follow_up=report.follow_up,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


@router.get('/internal/appointments/{appointment_id}/can-rate')
async def can_rate_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Endpoint interno para que el microservicio de ranking verifique si una cita es calificable.
    """
    stmt = select(Appointment).where(Appointment.id == appointment_id)
    appointment = (await db.execute(stmt)).scalar_one_or_none()
    if not appointment:
        return {"can_rate": False, "detail": "Cita no encontrada"}

    # Verificar que exista el informe
    report = (
        await db.execute(select(AppointmentReport).where(AppointmentReport.appointment_id == appointment_id))
    ).scalar_one_or_none()
    
    if not report:
        return {"can_rate": False, "detail": "No existe informe médico para esta cita"}

    return {
        "can_rate": True, 
        "doctor_id": appointment.doctor_id, 
        "patient_id": appointment.patient_user_id
    }


@router.post('/patient/appointments/{appointment_id}/rating', response_model=AppointmentRatingOut, status_code=status.HTTP_201_CREATED)
async def post_rating(
    appointment_id: int,
    payload: AppointmentRatingIn,
    current_user: CurrentUser = Depends(require_patient),
    db: AsyncSession = Depends(get_db),
):
    # verify appointment belongs to patient
    stmt = select(Appointment).where(Appointment.id == appointment_id, Appointment.patient_user_id == current_user.id)
    appointment = (await db.execute(stmt)).scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail='Cita no encontrada')

    # require that a report exists for this appointment
    report = (
        await db.execute(select(AppointmentReport).where(AppointmentReport.appointment_id == appointment_id))
    ).scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=422, detail='No se puede calificar hasta que exista un informe')

    existing = (
        await db.execute(
            select(AppointmentRating).where(
                AppointmentRating.appointment_id == appointment_id,
                AppointmentRating.patient_user_id == current_user.id,
            )
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail='Ya has calificado esta cita')

    now = datetime.utcnow()
    rating = AppointmentRating(
        appointment_id=appointment_id,
        patient_user_id=current_user.id,
        doctor_id=report.doctor_id,
        rating=payload.rating,
        comment=payload.comment,
        created_at=now,
    )
    db.add(rating)
    await db.flush()

    return AppointmentRatingOut(
        id=rating.id,
        appointment_id=rating.appointment_id,
        patient_user_id=rating.patient_user_id,
        doctor_id=rating.doctor_id,
        rating=rating.rating,
        comment=rating.comment,
        created_at=rating.created_at,
    )

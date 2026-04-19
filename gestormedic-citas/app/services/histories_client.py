import httpx

from app.core.config import settings


async def bootstrap_appointment_history(*, appointment_id: int, patient_user_id: int, doctor_profile_id: int, specialty_id: int, specialty_name: str):
    if not settings.HISTORIES_SERVICE_URL or not settings.HISTORIES_INTERNAL_API_KEY:
        return

    url = f"{settings.HISTORIES_SERVICE_URL.rstrip('/')}/internal/appointments/bootstrap"
    payload = {
        'appointment_id': appointment_id,
        'patient_user_id': patient_user_id,
        'doctor_profile_id': doctor_profile_id,
        'specialty_id': specialty_id,
        'specialty_name': specialty_name,
    }
    headers = {'x-internal-key': settings.HISTORIES_INTERNAL_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            await client.post(url, json=payload, headers=headers)
    except Exception:
        # No bloquea el flujo de reserva de cita.
        return

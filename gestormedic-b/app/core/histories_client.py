import httpx

from app.core.config import settings


async def bootstrap_patient_history(patient_user_id: int):
    if not settings.HISTORIES_SERVICE_URL or not settings.HISTORIES_INTERNAL_API_KEY:
        return

    url = f"{settings.HISTORIES_SERVICE_URL.rstrip('/')}/internal/patients/bootstrap"
    headers = {'x-internal-key': settings.HISTORIES_INTERNAL_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            await client.post(url, json={'patient_user_id': patient_user_id}, headers=headers)
    except Exception:
        # No bloquea el alta de usuarios.
        return

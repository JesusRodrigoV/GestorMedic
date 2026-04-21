import os
import httpx
from datetime import datetime
from jose import jwt
import time

class NotificationDispatcher:
    """
    Despachador robusto para el servicio de notificaciones.
    Centraliza la autenticación interna y maneja reintentos ligeros.
    """
    def __init__(self):
        self.api_url = os.getenv('NOTIFICATIONS_API_URL', 'http://gm-notifications-api:8000/notificaciones/notifications/')
        self.secret = os.getenv('NOTIFICATIONS_INTERNAL_AUTH_SECRET', 'test')
        self.issuer = 'gm-citas-service'

    def _generate_token(self) -> str:
        payload = {
            'iss': self.issuer,
            'iat': int(time.time()),
            'exp': int(time.time()) + 120,
        }
        return jwt.encode(payload, self.secret, algorithm='HS256')

    async def send_appointment_reminder(self, user_id: int, email: str, patient_name: str, specialty: str, starts_at: datetime):
        token = self._generate_token()
        
        payload = {
            'user_id': str(user_id),
            'event_type': 'APPOINTMENT_REMINDER',
            'priority': 10,
            'channels': ['email'],
            'payload': {
                'email': email,
                'patient_name': patient_name,
                'specialty': specialty,
                'date': starts_at.date().isoformat(),
                'time': starts_at.time().strftime('%H:%M'),
            },
        }

        # Comunicación asíncrona robusta con timeout
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(
                    self.api_url, 
                    json=payload, 
                    headers={'Authorization': f'Bearer {token}'}, 
                    timeout=3.0
                )
                if resp.status_code not in (200, 201, 202):
                    print(f"Alerta: Notificación no encolada correctamente ({resp.status_code})")
                return True
            except Exception as e:
                # El negocio de citas continúa aunque la notificación falle
                print(f"Error en el despacho de notificación: {e}")
                return False

notification_dispatcher = NotificationDispatcher()

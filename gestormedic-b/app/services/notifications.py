import jwt
import httpx
import os
from datetime import datetime, timedelta, timezone


class NotificationServiceDispatcher:
    def __init__(self):
        self.secret = os.getenv("INTERNAL_AUTH_SECRET")
        self.algorithm = os.getenv("AUTH_ALGORITHM", "HS256")
        self.notification_url = os.getenv(
            "NOTIFICATIONS_API_URL", "http://localhost:8001/notifications/"
        )

        if not self.secret:
            raise ValueError("Configuracion incompleta de seguridad interna")

    def _generate_internal_token(self) -> str:
        payload = {
            "iss": "gm-backend-central",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
            "iat": datetime.now(timezone.utc),
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    async def send_password_reset(
        self, user_id: str, email: str, reset_link: str
    ) -> bool:
        token = self._generate_internal_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        payload = {
            "user_id": user_id,
            "event_type": "PASSWORD_RESET",
            "priority": 12,
            "channels": ["email"],
            "payload": {
                "email": email,
                "reset_link": reset_link,
                "expiration_time": "15 minutos",
            },
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.notification_url, json=payload, headers=headers, timeout=5.0
                )
                return response.status_code == 202
            except httpx.RequestError:
                return False

import httpx
from app.providers.base import BaseProvider
from app.config import settings


class SendGridAdapter(BaseProvider):
    async def send(
        self, destination: str, body: str, subject: str = "Notificación Médica"
    ) -> bool:
        url = "https://api.sendgrid.com/v3/mail/send"
        headers = {
            "Authorization": f"Bearer {settings.sendgrid_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "personalizations": [{"to": [{"email": destination}]}],
            "from": {"email": settings.from_email, "name": "GestorMedic"},
            "subject": subject,
            "content": [{"type": "text/html", "value": body}],
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            return response.status_code in [200, 201, 202]

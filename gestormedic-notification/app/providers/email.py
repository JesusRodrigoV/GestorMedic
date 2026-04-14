import httpx
from app.providers.base import BaseProvider
from app.config import settings


class SendGridEmailProvider(BaseProvider):
    def __init__(self):
        self.url = "https://api.sendgrid.com/v3/mail/send"
        self.headers = {
            "Authorization": f"Bearer {settings.sendgrid_api_key}",
            "Content-Type": "application/json",
        }

    async def send(self, destination: str, body: str) -> bool:
        payload = {
            "personalizations": [{"to": [{"email": destination}]}],
            "from": {"email": settings.from_email, "name": "GestorMedic"},
            "subject": "Notificación Médica",
            "content": [{"type": "text/html", "value": body}],
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.url, json=payload, headers=self.headers)
            return response.status_code in [200, 201, 202]

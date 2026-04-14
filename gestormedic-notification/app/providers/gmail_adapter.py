import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.providers.base import BaseProvider
from app.config import settings


class GmailAdapter(BaseProvider):
    async def send(
        self, destination: str, body: str, subject: str = "Notificación Médica"
    ) -> bool:
        try:
            msg = MIMEMultipart()
            msg["From"] = settings.from_email
            msg["To"] = destination
            msg["Subject"] = subject

            msg.attach(MIMEText(body, "html"))

            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(settings.from_email, settings.gmail_app_password)
                server.send_message(msg)
            return True
        except Exception as e:
            print(f"Fallo en envío Gmail: {e}")
            return False

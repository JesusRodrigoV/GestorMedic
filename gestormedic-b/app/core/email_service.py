from pathlib import Path
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from jinja2 import Environment, FileSystemLoader
from app.core.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent
template_env = Environment(loader=FileSystemLoader(BASE_DIR / "templates"))

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME
)

fm = FastMail(conf)

async def send_password_reset_email(email_to: EmailStr, token: str, username: str):
    reset_url = f"{settings.FRONTEND_RESET_PASSWORD_URL}?token={token}"
    
    template = template_env.get_template("reset_password.html")
    html_content = template.render(
        username=username,
        reset_url=reset_url,
        expire_minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
    )

    message = MessageSchema(
        subject="Restablece tu contraseña - Sistema Médico",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html
    )

    try:
        await fm.send_message(message)
        print(f"📧 Correo de reseteo enviado con éxito a {email_to}")
    except Exception as e:
        print(f"Error crítico al enviar correo: {e}")
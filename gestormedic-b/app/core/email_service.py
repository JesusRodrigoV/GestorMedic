from app.services.notifications import NotificationServiceDispatcher
from app.core.config import settings

notification_dispatcher = NotificationServiceDispatcher()

async def send_password_reset_email(email_to: EmailStr, token: str, username: str, user_id: int):
    reset_url = f"{settings.FRONTEND_RESET_PASSWORD_URL}?token={token}"

    # Delegar al microservicio de notificaciones (Asíncrono vía Celery internamente)
    success = await notification_dispatcher.send_password_reset(
        user_id=str(user_id),
        email=email_to,
        reset_link=reset_url
    )

    if success:
        print(f" Notificación de reseteo encolada con éxito para {email_to}")
    else:
        print(f" Error al encolar notificación para {email_to}")
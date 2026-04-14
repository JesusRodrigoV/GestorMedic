import asyncio
from app.celery_app import celery_engine
from app.database import SessionLocal
from app.models import NotificationRecord, CustomTemplate
from app.renderer import render_notification
from app.providers.factory import ProviderFactory


def get_whatsapp_params(event_type: str, payload: dict) -> dict:
    if event_type == "APPOINTMENT_REMINDER":
        return {
            "patient_name": payload.get("patient_name"),
            "specialty": payload.get("specialty"),
            "appointment_date": payload.get("date"),
            "appointment_time": payload.get("time"),
        }
    return {}


async def async_process(record_id: int, channels: list, owner_id: str):
    db = SessionLocal()
    record = (
        db.query(NotificationRecord).filter(NotificationRecord.id == record_id).first()
    )

    if not record:
        db.close()
        return

    try:
        custom = None
        if owner_id:
            custom = (
                db.query(CustomTemplate)
                .filter(
                    CustomTemplate.owner_id == owner_id,
                    CustomTemplate.event_type == record.event_type,
                )
                .first()
            )

        for channel in channels:
            provider = ProviderFactory.get_provider(channel)
            if not provider:
                continue

            destination = (
                record.payload.get("phone")
                if channel == "whatsapp"
                else record.payload.get("email")
            )

            if not destination:
                print(
                    f"!!! ADVERTENCIA: No se encontro destino para el canal {channel}"
                )
                continue

            message_body = render_notification(
                record.event_type,
                channel,
                record.payload,
                custom_content=custom.content if custom else None,
            )

            if channel == "whatsapp":
                template = (
                    "appointment_reminder_v1"
                    if record.event_type == "APPOINTMENT_REMINDER"
                    else None
                )
                params = get_whatsapp_params(record.event_type, record.payload)
                await provider.send(
                    destination,
                    message_body,
                    template_name=template,
                    parameters=params,
                    lang="es",
                )
            else:
                await provider.send(destination, message_body)

        record.status = "SENT"
    except Exception as e:
        record.status = "FAILED"
        print(f"!!! ERROR CRITICO EN WORKER: {str(e)}")
        raise e
    finally:
        db.commit()
        db.close()


@celery_engine.task(bind=True, max_retries=3)
def process_notification(self, record_id: int, channels: list, owner_id: str = None):
    try:
        asyncio.run(async_process(record_id, channels, owner_id))
    except Exception as exc:
        self.retry(exc=exc, countdown=60)

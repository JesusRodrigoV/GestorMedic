from fastapi import FastAPI
from app.routers import notifications, monitoring, webhook

app = FastAPI(
    title="GestorMedic Notification Service",
    description="Servicio especializado en el despacho omnicanal de notificaciones medicas con soporte para prioridades y validacion criptografica.",
    version="1.0.0",
    contact={
        "name": "Sistemas GestorMedic",
    },
)

app.include_router(notifications.router)
app.include_router(monitoring.router)
app.include_router(webhook.router)

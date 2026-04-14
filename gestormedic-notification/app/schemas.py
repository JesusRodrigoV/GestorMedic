from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import List, Dict, Any, Optional, Literal
import re


class NotificationRequest(BaseModel):
    user_id: str = Field(..., description="ID unico del usuario en el sistema central")
    event_type: str = Field(
        ..., description="Tipo de evento (ej: APPOINTMENT_REMINDER, SECURITY_OTP)"
    )
    priority: int = Field(..., ge=0, le=15, description="Nivel de prioridad de 0 a 15")
    channels: List[Literal["whatsapp", "email"]] = Field(
        ..., 
        description="Lista de canales soportados por el sistema."
    )
    payload: Dict[str, Any] = Field(
        ..., description="Datos dinamicos requeridos segun el event_type"
    )

    # Configuracion para mejorar Swagger
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": "USR-12345",
                "event_type": "APPOINTMENT_REMINDER",
                "priority": 10,
                "channels": ["whatsapp", "email"],
                "payload": {
                    "patient_name": "Nombre Apellido",
                    "specialty": "Medicina General",
                    "date": "2026-05-20",
                    "time": "14:30",
                    "phone": "59170000000",
                    "email": "usuario@ejemplo.com",
                },
            }
        }
    )

    @model_validator(mode="after")
    def validate_integrity(self) -> "NotificationRequest":
        channels = self.channels
        payload = self.payload
        event = self.event_type

        if "email" in channels:
            email = payload.get("email")
            if not email:
                raise ValueError("El campo 'email' es obligatorio para el canal email")
            if not re.match(r"[^@]+@[^@]+\.[^@]+", str(email)):
                raise ValueError(
                    f"La direccion '{email}' no cumple con el formato RFC 5322"
                )

        if "whatsapp" in channels:
            phone = payload.get("phone")
            if not phone:
                raise ValueError(
                    "El campo 'phone' es obligatorio para el canal whatsapp"
                )
            if not re.match(r"^\d{8,15}$", str(phone)):
                raise ValueError(
                    f"El numero '{phone}' debe cumplir con el estandar E.164"
                )

        if event == "APPOINTMENT_REMINDER":
            required_fields = ["patient_name", "specialty", "date", "time"]
            for field in required_fields:
                if field not in payload or not payload.get(field):
                    raise ValueError(
                        f"El campo '{field}' es obligatorio para el evento APPOINTMENT_REMINDER"
                    )

        return self

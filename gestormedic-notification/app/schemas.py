from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import List, Dict, Any, Literal
import re


class NotificationRequest(BaseModel):
    user_id: str = Field(..., description="ID unico del usuario")
    event_type: str = Field(
        ..., description="Tipo de evento para seleccion de plantilla"
    )
    priority: int = Field(..., ge=0, le=15)
    channels: List[Literal["whatsapp", "email"]] = Field(..., min_length=1)
    payload: Dict[str, Any]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": "USR-99",
                "event_type": "PASSWORD_RESET",
                "priority": 10,
                "channels": ["email"],
                "payload": {
                    "email": "paciente@ejemplo.com",
                    "reset_link": "https://gestormedic.com/reset/abc123",
                    "expiration_time": "15 minutos",
                },
            }
        }
    )

    @model_validator(mode="after")
    def validate_integrity(self) -> "NotificationRequest":
        ch = self.channels
        pl = self.payload
        ev = self.event_type

        if "email" in ch:
            email = pl.get("email")
            if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", str(email)):
                raise ValueError("Email ausente o invalido para canal email")

        if "whatsapp" in ch:
            phone = pl.get("phone")
            if not phone or not re.match(r"^\d{8,15}$", str(phone)):
                raise ValueError("Telefono ausente o invalido para canal whatsapp")

        validation_map = {
            "APPOINTMENT_REMINDER": ["patient_name", "specialty", "date", "time"],
            "PASSWORD_RESET": ["email", "reset_link", "expiration_time"],
            "SECURITY_OTP": ["otp_code"],
            "WELCOME_MESSAGE": ["email", "patient_name", "login_url"],
            "APPOINTMENT_CANCELLED": ["date", "reason"],
            "ACCOUNT_ALERTS": ["email", "action_details", "ip_address"],
        }

        if ev in validation_map:
            for field in validation_map[ev]:
                if field not in pl or not pl.get(field):
                    raise ValueError(
                        f"El campo '{field}' es obligatorio para el evento {ev}"
                    )

        return self

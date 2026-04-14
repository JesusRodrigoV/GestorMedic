from pydantic import BaseModel, HttpUrl, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from app.core.enums import PlanType
import re

class ClinicBase(BaseModel):
    name: str
    nit_ruc: str
    address: Optional[str] = None
    phone: Optional[str] = None
    logo_url: Optional[str] = None
    plan: PlanType = PlanType.FREE

    @field_validator('nit_ruc')
    @classmethod
    def validate_nit(cls, v: str) -> str:
        if not re.match(r"^\d{7,15}$", v):
            raise ValueError("El NIT/RUC debe ser numérico y tener entre 7 y 15 dígitos")
        return v

class ClinicCreate(ClinicBase):
    pass

class ClinicUpdate(BaseModel):
    name: Optional[str] = None
    nit_ruc: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None
    plan: Optional[PlanType] = None

class ClinicOut(ClinicBase):
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
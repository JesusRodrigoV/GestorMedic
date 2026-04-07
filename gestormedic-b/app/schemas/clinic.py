from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime
from app.core.enums import PlanType

class ClinicBase(BaseModel):
    name: str
    nit_ruc: str
    address: Optional[str] = None
    phone: Optional[str] = None
    logo_url: Optional[str] = None
    plan: PlanType = PlanType.FREE

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

    class Config:
        from_attributes = True
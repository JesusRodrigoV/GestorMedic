from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from typing import Optional
import re

class InsuranceProfileBase(BaseModel):
    company_name: str
    tax_id: str
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    office_address: Optional[str] = None

    @field_validator('tax_id')
    @classmethod
    def validate_tax_id(cls, v: str) -> str:
        if not re.match(r"^\d{7,15}$", v):
            raise ValueError("El NIT/Tax ID debe ser numérico y tener entre 7 y 15 dígitos")
        return v

class InsuranceProfileCreate(InsuranceProfileBase):
    user_id: int

class InsuranceProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    tax_id: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    office_address: Optional[str] = None

class InsuranceProfileOut(InsuranceProfileBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
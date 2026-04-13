from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from datetime import date
import re

class PatientProfileBase(BaseModel):
    ci_number: str
    date_of_birth: date
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    occupation: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    @field_validator('ci_number')
    @classmethod
    def validate_ci(cls, v: str) -> str:
        if not re.match(r"^\d{5,10}(-\w{1,2})?$", v):
            raise ValueError("Formato de CI no válido")
        return v

class PatientProfileCreate(PatientProfileBase):
    user_id: int

class PatientProfileUpdate(BaseModel):
    ci_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    occupation: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class PatientProfileOut(PatientProfileBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
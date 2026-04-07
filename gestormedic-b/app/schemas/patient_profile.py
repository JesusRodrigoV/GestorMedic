from pydantic import BaseModel
from typing import Optional
from datetime import date

class PatientProfileBase(BaseModel):
    ci_number: str
    date_of_birth: date
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    occupation: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

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

    class Config:
        from_attributes = True
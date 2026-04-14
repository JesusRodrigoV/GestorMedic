from pydantic import BaseModel, ConfigDict
from typing import Optional

class ClinicDoctorOut(BaseModel):
    clinic_id: int
    doctor_id: int
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)

class DoctorSpecialtyOut(BaseModel):
    doctor_id: int
    specialty_id: int
    
    model_config = ConfigDict(from_attributes=True)

class ClinicSpecialtyOut(BaseModel):
    clinic_id: int
    specialty_id: int
    
    model_config = ConfigDict(from_attributes=True)
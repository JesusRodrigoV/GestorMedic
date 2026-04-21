from pydantic import BaseModel, ConfigDict, computed_field
from typing import Optional, List
from app.schemas.specialty import SpecialtyOut

class DoctorProfileBase(BaseModel):
    license_number: str
    bio: Optional[str] = None
    experience_years: int = 0
    signature_url: Optional[str] = None
    photo_url: Optional[str] = None
    base_consultation_price: int = 0
    is_telemedicine_enabled: bool = False

class DoctorProfileCreate(DoctorProfileBase):
    user_id: int
    specialty_ids: List[int] = []

class DoctorProfileUpdate(BaseModel):
    license_number: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    signature_url: Optional[str] = None
    photo_url: Optional[str] = None
    base_consultation_price: Optional[int] = None
    is_telemedicine_enabled: Optional[bool] = None
    specialty_ids: Optional[List[int]] = None

class DoctorProfileOut(DoctorProfileBase):
    id: int
    user_id: int
    
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def clinics(self) -> List[int]:
        if hasattr(self, "clinic_associations"):
            return [assoc.clinic_id for assoc in self.clinic_associations if assoc.is_active]
        return []

    @computed_field
    @property
    def specialties(self) -> List[SpecialtyOut]:
        if hasattr(self, "specialty_associations"):
            return [assoc.specialty for assoc in self.specialty_associations]
        return []
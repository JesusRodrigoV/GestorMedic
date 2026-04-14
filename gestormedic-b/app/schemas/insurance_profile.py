from pydantic import BaseModel
from typing import Optional

class InsuranceProfileBase(BaseModel):
    company_name: str
    tax_id: str
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    office_address: Optional[str] = None

class InsuranceProfileCreate(InsuranceProfileBase):
    user_id: int

class InsuranceProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    tax_id: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    office_address: Optional[str] = None

class InsuranceProfileOut(InsuranceProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
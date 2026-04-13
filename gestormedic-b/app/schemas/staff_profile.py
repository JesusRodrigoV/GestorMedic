from pydantic import BaseModel
from typing import Optional

class StaffProfileBase(BaseModel):
    employee_id: Optional[str] = None
    position: Optional[str] = None

class StaffProfileCreate(StaffProfileBase):
    user_id: int

class StaffProfileUpdate(BaseModel):
    employee_id: Optional[str] = None
    position: Optional[str] = None

class StaffProfileOut(StaffProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
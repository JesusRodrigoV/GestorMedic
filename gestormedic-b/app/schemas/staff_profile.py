from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)
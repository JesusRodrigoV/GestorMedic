from pydantic import BaseModel, ConfigDict
from typing import Optional

class RoomBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    clinic_id: int

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    clinic_id: Optional[int] = None

class RoomOut(RoomBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
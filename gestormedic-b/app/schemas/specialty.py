from pydantic import BaseModel, ConfigDict
from typing import Optional

class SpecialtyBase(BaseModel):
    name: str
    description: Optional[str] = None

class SpecialtyCreate(SpecialtyBase):
    pass

class SpecialtyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class SpecialtyOut(SpecialtyBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
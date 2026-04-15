import re
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict, computed_field

def validate_password_strength_func(v: str) -> str:
    if v is None:
        return v
    if len(v) < 8:
        raise ValueError('La contraseña debe tener 8 caracteres como mínimo')
    if not re.search(r"[A-Z]", v):
        raise ValueError("La contraseña debe contener al menos una mayúscula")
    if not re.search(r"[0-9]", v):
        raise ValueError("La contraseña debe contener al menos un número")
    return v

class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None
    google_id: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: Optional[str]) -> Optional[str]:
        return validate_password_strength_func(v)

class AdminUserCreate(UserBase):
    password: Optional[str] = None
    role_id: int
    clinic_id: Optional[int] = None
    is_active: Optional[bool] = True

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: Optional[str]) -> Optional[str]:
        return validate_password_strength_func(v)

class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserUpdateProfile(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    #email: Optional[EmailStr] = None
    photo_url: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    credential: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    role_id: int
    clinic_id: Optional[int] = None
    photo_url: Optional[str] = None 
    created_at: datetime 

    model_config = ConfigDict(from_attributes=True)

    is_totp_enabled: bool = False
    locked_until: Optional[datetime] = None
    @computed_field
    @property
    def full_name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.username
    
class UserSettingsUpdate(BaseModel):
    is_totp_enabled: bool
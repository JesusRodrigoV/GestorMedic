from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import re

def validate_password_strength_func(v: str) -> str:
    if v is None:
        return v
        
    if len(v) < 8:
        raise ValueError('La contraseña debe tener 8 caracteres como minimo')
    if not re.search(r"[A-Z]", v):
        raise ValueError("La contraseña debe contener al menos una mayuscula")
    if not re.search(r"[0-9]", v):
        raise ValueError("La contraseña debe contener al menos un numero")
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
    def validate_password_strength(cls, v: Optional[str]) -> Optional[str]:
        return validate_password_strength_func(v)

class AdminUserCreate(UserBase):
    password: Optional[str] = None
    role_id: int
    clinic_id: Optional[int] = None
    is_active: Optional[bool] = True

    @field_validator('password')
    def validate_password_strength(cls, v: Optional[str]) -> Optional[str]:
        return validate_password_strength_func(v)

class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role_id: Optional[int] = None
    clinic_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserUpdateProfile(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    is_admin: bool
    role_id: int
    clinic_id: Optional[int] = None
    photo_url: Optional[str] = None 
    created_at: datetime 
    #para status
    # status: str

    class Config:
        from_attributes = True

class UserOutWithRole(UserOut):
    pass
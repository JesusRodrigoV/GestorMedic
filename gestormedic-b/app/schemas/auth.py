import re
from typing import Annotated, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe contener al menos una mayúscula")
        if not re.search(r"[0-9]", v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v

class LoginStep2Response(BaseModel):
    step: str = "2fa_required"
    session_token: str 

TOTPCodem = Annotated[str, Field(strip_whitespace=True, min_length=6, max_length=10)]

class TOTPLoginRequest(BaseModel):
    session_token: str
    code: TOTPCodem
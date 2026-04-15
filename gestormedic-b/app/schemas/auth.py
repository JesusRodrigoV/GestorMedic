from datetime import datetime
import re
from typing import Annotated, List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from zxcvbn import zxcvbn

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
        result = zxcvbn(v)
        if result['score'] < 3:
            raise ValueError("La contraseña es muy debil. Intenta usar mas variedad de caracteres.")
        return v

class LoginStep2Response(BaseModel):
    step: str = "2fa_required"
    session_token: str 

TOTPCodem = Annotated[str, Field(strip_whitespace=True, min_length=6, max_length=10)]

class TOTPLoginRequest(BaseModel):
    session_token: str
    code: TOTPCodem

class ActiveSessionOut(BaseModel):
    jti: str
    device_info: Optional[str] = "Desconocido"
    created_at: datetime
    expires_at: datetime
    is_current: bool = False 

class TOTPSetupOut(BaseModel):
    secret: str
    qr_code_uri: str
    backup_codes: List[str]

class TOTPConfirmRequest(BaseModel):
    code: str
    #secret: str
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks, Cookie
from sqlalchemy.orm import Session
from typing import List, Optional, Union
import pyotp

from app.db.session import get_db
from app.core.config import settings
from app.core.security import (
    create_access_token, create_refresh_token, create_2fa_token, 
    verify_password, get_password_hash, decode_token
)
from app.core.audit import audit_event
from app.core.enums import AuditEvent, UserRole
from app.core.dependencies import get_current_active_user
from app.core import policia
from app.crud import user as crud_user
from app.crud import token as crud_token
from app.crud import two_factor as crud_2fa
from app.schemas.auth import (
    LoginRequest, TokenResponse, LoginStep2Response, 
    TOTPLoginRequest, ActiveSessionOut, TOTPSetupOut, TOTPConfirmRequest
)
from app.schemas.user import UserCreate, UserOut
from app.models.user import User

router = APIRouter()



def _issue_tokens(db: Session, user: User, response: Response, request: Request):
    extra_claims = {"role": user.role.name}
    access_token = create_access_token(subject=user.email, extra_claims=extra_claims)
    rt_data = create_refresh_token(subject=user.email)
    
    crud_token.create_refresh_token_record(
        db, 
        user_id=user.id, 
        jti=rt_data["jti"], 
        expires_at=rt_data["expires_at"],
        device_info=request.headers.get("user-agent", "Desconocido"),
    )
    
    response.set_cookie(
        key="refresh_token", 
        value=rt_data["token"],
        httponly=True, 
        secure=True, 
        samesite="lax",
        expires=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    return access_token

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@audit_event(AuditEvent.REGISTER)
async def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = crud_user.get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    return crud_user.create_public_user(
        db, 
        user_in=payload, 
        role_name=UserRole.PACIENTE.value 
    )

@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/login", response_model=Union[TokenResponse, LoginStep2Response])
async def login(
    request: Request,
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    user = crud_user.get_user_by_email(db, payload.email)
    
    if not user or not verify_password(payload.password, user.hashed_password):
        await policia.increment_login_failure(payload.email)
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    if policia.is_account_locked(user):
        raise HTTPException(status_code=403, detail="Cuenta bloqueada temporalmente")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Cuenta desactivada")

    await policia.clear_login_failures(user.email)

    if user.is_totp_enabled:
        session_token = create_2fa_token(subject=user.email)
        return LoginStep2Response(session_token=session_token)

    access_token = _issue_tokens(db, user, response, request)
    return TokenResponse(access_token=access_token, refresh_token="check_cookies", token_type="bearer")

@router.post("/2fa/verify", response_model=TokenResponse)
async def verify_2fa(
    request: Request,
    payload: TOTPLoginRequest, 
    response: Response, 
    db: Session = Depends(get_db)
):
    email = decode_token(payload.session_token)
    user = crud_user.get_user_by_email(db, email)
    
    if not user or not pyotp.TOTP(user.totp_secret).verify(payload.code):
        raise HTTPException(status_code=401, detail="Código 2FA inválido")

    access_token = _issue_tokens(db, user, response, request)
    return TokenResponse(access_token=access_token, refresh_token="check_cookies")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No hay refresh token")
    
    payload = decode_token(refresh_token)
    jti = payload.get("jti")
    
    if not crud_token.is_refresh_token_valid(db, jti):
        raise HTTPException(status_code=401, detail="Token revocado o inválido")
    
    user = crud_user.get_user_by_email(db, payload.get("sub"))
    crud_token.revoke_refresh_token_by_jti(db, jti)
    
    access_token = _issue_tokens(db, user, response, request)
    return TokenResponse(access_token=access_token, refresh_token="check_cookies")


@router.post("/2fa/setup", response_model=TOTPSetupOut)
def setup_2fa(current_user: User = Depends(get_current_active_user)):
    """Genera el secreto para que el usuario escanee el QR."""
    secret = pyotp.random_base32()
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email, 
        issuer_name="GestorMedic"
    )
    backup_codes = [pyotp.random_base32()[:8] for _ in range(5)]
    
    return TOTPSetupOut(secret=secret, qr_code_uri=otp_uri, backup_codes=backup_codes)

@router.post("/2fa/confirm")
def confirm_2fa(
    payload: TOTPConfirmRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if pyotp.TOTP(payload.secret).verify(payload.code):
        crud_user.enable_2fa(db, user=current_user, secret=payload.secret)
        return {"msg": "2FA activado correctamente"}
    raise HTTPException(status_code=400, detail="Código de verificación incorrecto")

@router.get("/sessions", response_model=List[ActiveSessionOut])
def get_my_sessions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud_token.get_active_sessions_for_user(db, user_id=current_user.id)

@router.delete("/sessions/{jti}")
def revoke_session(
    jti: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    crud_token.revoke_refresh_token_by_jti(db, jti, user_id=current_user.id)
    return {"msg": "Sesión cerrada remotamente"}

@router.post("/logout")
@audit_event(AuditEvent.LOGOUT)
def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if refresh_token:
        payload = decode_token(refresh_token)
        crud_token.revoke_refresh_token_by_jti(db, payload.get("jti"))
    
    response.delete_cookie("refresh_token")
    return {"msg": "Sesión cerrada con éxito"}
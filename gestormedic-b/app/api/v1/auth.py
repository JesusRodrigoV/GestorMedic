from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks, Cookie
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Union
import pyotp
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

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
from app.rate_limiting import limiter 
from app.crud import user as crud_user
from app.crud import token as crud_token
from app.crud import two_factor as crud_2fa
from app.schemas.auth import (
    LoginRequest, TokenResponse, LoginStep2Response, 
    TOTPLoginRequest, ActiveSessionOut, TOTPSetupOut, TOTPConfirmRequest,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.core import email_service
from app.schemas.user import UserCreate, UserOut
from app.models.user import User
from app.schemas.user import GoogleAuthRequest 
from app.core.histories_client import bootstrap_patient_history

router = APIRouter()

async def _issue_tokens(db: AsyncSession, user: User, response: Response, request: Request):
    doctor_profile_id = None
    if user.role.name.lower() == 'medico':
        from app.models.doctor_profile import DoctorProfile
        result = await db.execute(
            select(DoctorProfile.id).where(DoctorProfile.user_id == user.id)
        )
        doctor_profile_id = result.scalar_one_or_none()

    access_token = create_access_token(
        subject=user.email, 
        role=user.role.name, 
        user_id=user.id,
        clinic_id=getattr(user, 'clinic_id', None),
        doctor_profile_id=doctor_profile_id
    )
    
    rt_data = create_refresh_token(subject=user.email)
    
    db_expires = rt_data["expires_at"]
    if db_expires.tzinfo is not None:
        db_expires = db_expires.replace(tzinfo=None)
    
    # Guardamos el registro en la DB
    await crud_token.create_refresh_token_record(
        db, 
        user_id=user.id, 
        jti=rt_data["jti"], 
        expires_at=db_expires,
        device_info=request.headers.get("user-agent", "Desconocido"),
    )
    
    response.set_cookie(
        key="refresh_token", 
        value=rt_data["token"],
        httponly=True, 
        secure=True, 
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return access_token

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@audit_event(AuditEvent.REGISTER)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await crud_user.get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    user = await crud_user.create_public_user(
        db, 
        user_in=payload, 
        role_name=UserRole.PACIENTE.value 
    )
    await bootstrap_patient_history(user.id)
    return user

@router.post("/login", response_model=Union[TokenResponse, LoginStep2Response])
@limiter.limit("5/minute")
async def login(
    request: Request,
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    user = await crud_user.get_user_by_email(db, payload.email)
    
    if not user or not verify_password(payload.password, user.hashed_password):
        await policia.increment_login_failure(payload.email)
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    if await policia.is_account_locked(user, user.email):
        raise HTTPException(status_code=403, detail="Cuenta bloqueada temporalmente")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Cuenta desactivada")

    await policia.clear_login_failures(user.email)

    if user.is_totp_enabled:
        session_token = create_2fa_token(subject=user.email)
        return LoginStep2Response(session_token=session_token)

    access_token = await _issue_tokens(db, user, response, request)
    return TokenResponse(access_token=access_token, refresh_token="check_cookies", token_type="bearer")


@router.post("/login/google", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login_google(
    request: Request,
    payload: GoogleAuthRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    try:
        idinfo = id_token.verify_oauth2_token(
            payload.credential, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        print(f"Error exacto de Google: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=str(e)
        )

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El token de Google no contiene un correo electrónico")

    user = await crud_user.get_user_by_email(db, email)

    if not user:
        google_id = idinfo.get("sub")
        username = idinfo.get("name", email.split("@")[0])
        first_name = idinfo.get("given_name")
        last_name = idinfo.get("family_name")
        if not google_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google token inválido: falta identificador 'sub'")
        user = await crud_user.create_user_by_google(
            db,
            email=email,
            username=username,
            google_id=google_id,
            first_name=first_name,
            last_name=last_name
        )
        await bootstrap_patient_history(user.id)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Cuenta desactivada")

    access_token = await _issue_tokens(db, user, response, request)
    return TokenResponse(access_token=access_token, refresh_token="check_cookies", token_type="bearer")


@router.post("/2fa/verify", response_model=TokenResponse)
@limiter.limit("3/minute")
async def verify_2fa(
    request: Request,
    payload: TOTPLoginRequest, 
    response: Response, 
    db: AsyncSession = Depends(get_db)
):
    token_payload = decode_token(payload.session_token)
    email = token_payload.get("sub")
    
    if not email:
        raise HTTPException(status_code=401, detail="Token inválido o corrupto")

    user = await crud_user.get_user_by_email(db, email)
    
    if not user or not pyotp.TOTP(user.totp_secret).verify(payload.code):
        raise HTTPException(status_code=401, detail="Código 2FA inválido")

    access_token = await _issue_tokens(db, user, response, request)
    return TokenResponse(access_token=access_token, refresh_token="check_cookies")

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No hay refresh token")
    
    payload = decode_token(refresh_token)
    jti = payload.get("jti")
    
    if not await crud_token.is_refresh_token_valid(db, jti):
        raise HTTPException(status_code=401, detail="Token revocado o inválido")
    
    user = await crud_user.get_user_by_email(db, payload.get("sub"))
    await crud_token.revoke_refresh_token_by_jti(db, jti)
    
    access_token = await _issue_tokens(db, user, response, request)
    return TokenResponse(access_token=access_token, refresh_token="check_cookies")

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
@audit_event(AuditEvent.PASSWORD_RESET_REQUEST)
async def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    user = await crud_user.get_user_by_email(db, email=body.email)
    
    if user and user.is_active:
        token = await crud_token.create_password_reset_token(db, user_id=user.id)
        
        background_tasks.add_task(
            email_service.send_password_reset_email,
            email_to=user.email,
            token=token,
            username=user.username
        )
    return {"msg": "Si el correo está registrado y activo, se enviará un enlace de recuperación a su bandeja."}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
@audit_event(AuditEvent.PASSWORD_RESET_SUCCESS)
async def reset_password(
    body: ResetPasswordRequest, 
    db: AsyncSession = Depends(get_db)
):
    user = await crud_token.get_user_by_reset_token(db, token=body.token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token de recuperación es inválido o ha expirado."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se puede cambiar la contraseña de una cuenta inactiva."
        )

    await crud_user.update_password(db, db_user=user, new_password=body.new_password)
    await crud_token.delete_reset_token(db, token=body.token)
    await crud_token.revoke_all_sessions_for_user(db, user_id=user.id)
    
    return {"msg": "Contraseña actualizada exitosamente. Inicie sesión nuevamente."}

@router.post("/2fa/setup", response_model=TOTPSetupOut)
async def setup_2fa(current_user: User = Depends(get_current_active_user)):
    secret = pyotp.random_base32()
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email, 
        issuer_name="GestorMedic"
    )
    backup_codes = [pyotp.random_base32()[:8] for _ in range(5)]
    
    return TOTPSetupOut(secret=secret, qr_code_uri=otp_uri, backup_codes=backup_codes)

@router.post("/2fa/confirm")
async def confirm_2fa(
    payload: TOTPConfirmRequest, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if pyotp.TOTP(payload.secret).verify(payload.code):
        await crud_user.enable_2fa(db, user=current_user, secret=payload.secret)
        return {"msg": "2FA activado correctamente"}
    raise HTTPException(status_code=400, detail="Código de verificación incorrecto")

@router.get("/sessions", response_model=List[ActiveSessionOut])
async def get_my_sessions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    return await crud_token.get_active_sessions_for_user(db, user_id=current_user.id)

@router.delete("/sessions/{jti}")
async def revoke_session(
    jti: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    await crud_token.revoke_refresh_token_by_jti(db, jti, user_id=current_user.id)
    return {"msg": "Sesión cerrada remotamente"}

@router.post("/logout")
@audit_event(AuditEvent.LOGOUT)
async def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if refresh_token:
        payload = decode_token(refresh_token)
        await crud_token.revoke_refresh_token_by_jti(db, payload.get("jti"))
    
    response.delete_cookie("refresh_token")
    return {"msg": "Sesión cerrada con éxito"}

@router.get("/me", response_model=UserOut)
async def read_user_me(current_user: User = Depends(get_current_active_user)):
    return current_user
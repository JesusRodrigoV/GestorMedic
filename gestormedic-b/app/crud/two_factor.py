import secrets
import pyotp
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.encryption import encrypt_data, decrypt_data
from app.core.security import get_password_hash, verify_password
from app.models.user import User

def generate_totp_secret() -> str:
    return pyotp.random_base32()

def get_otpauth_uri(secret: str, email: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(
        name=email, 
        issuer_name="Notificaciones Médicas"
    )

def verify_totp_code(secret_encriptado: str, code: str) -> bool:
    try:
        secret_plano = decrypt_data(secret_encriptado)
        totp = pyotp.TOTP(secret_plano)
        # valid_window=1 permite una desviaciOn de 30s
        return totp.verify(code, valid_window=1)
    except Exception:
        return False

async def save_totp_secret_for_user(db: AsyncSession, user: User, secret_plano: str):
    user.totp_secret = encrypt_data(secret_plano)
    user.is_totp_enabled = False
    await db.commit()

async def activate_totp_for_user(db: AsyncSession, user: User):
    user.is_totp_enabled = True
    await db.commit()

async def disable_totp_for_user(db: AsyncSession, user: User):
    user.totp_secret = None
    user.is_totp_enabled = False
    user.backup_codes = []
    await db.commit()

async def generate_and_store_backup_codes(db: AsyncSession, user: User) -> List[str]:
    plaintext_codes = []
    hashed_codes = []

    for _ in range(5):
        code = f"{secrets.token_hex(2)}-{secrets.token_hex(2)}"
        plaintext_codes.append(code)
        hashed_codes.append(get_password_hash(code))

    user.backup_codes = hashed_codes
    await db.commit()
    return plaintext_codes

async def validate_backup_code(db: AsyncSession, user: User, code: str) -> bool:
    if not user.backup_codes:
        return False

    for hashed_code in user.backup_codes:
        if verify_password(code, hashed_code):
            updated_codes = list(user.backup_codes)
            updated_codes.remove(hashed_code)
            
            user.backup_codes = updated_codes
            await db.commit()
            return True
            
    return False
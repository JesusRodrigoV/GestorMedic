from jose import JWTError, jwt

from app.core.config import settings


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get('type') != 'access':
            raise ValueError('Token invalido')
        return payload
    except JWTError as exc:
        raise ValueError('Token invalido') from exc

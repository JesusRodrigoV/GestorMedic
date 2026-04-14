import jwt
from datetime import datetime, timezone
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

security = HTTPBearer()


def verify_internal_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token, settings.internal_auth_secret, algorithms=[settings.auth_algorithm]
        )

        issuer = payload.get("iss")
        if issuer != "gm-backend-central":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Emisor no autorizado"
            )

        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido"
        )

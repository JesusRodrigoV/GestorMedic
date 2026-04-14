import jwt
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

SECRET = os.getenv("INTERNAL_AUTH_SECRET")
ALGORITHM = os.getenv("AUTH_ALGORITHM", "HS256")

if not SECRET:
    raise ValueError("No se encontro la variable INTERNAL_AUTH_SECRET en el .env")

payload = {
    "iss": "gm-backend-central",
    "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    "iat": datetime.now(timezone.utc),
}

token = jwt.encode(payload, SECRET, algorithm=ALGORITHM)
print(token)

import os
from dataclasses import dataclass


# Defaults for test process so Settings() can initialize without depender de .env local.
os.environ.setdefault('DATABASE_URL', 'postgresql+asyncpg://postgres:admin@localhost:5432/gestormedic_db')
os.environ.setdefault(
    'MONGODB_URI',
    'mongodb://localhost:27017/?directConnection=true',
)
os.environ.setdefault('MONGODB_DB_NAME', 'Gestormedic-Historiales')
os.environ.setdefault('SECRET_KEY', 'test-secret')
os.environ.setdefault('INTERNAL_API_KEY', 'test-internal-key')
os.environ.setdefault('APPWRITE_ENDPOINT', 'https://sfo.cloud.appwrite.io/v1')
os.environ.setdefault('APPWRITE_PROJECT_ID', '69e3a6230015cdb907da')
os.environ.setdefault('APPWRITE_API_KEY', 'test-appwrite-key')
os.environ.setdefault('APPWRITE_BUCKET_PATIENT_FILES', 'patient-files')


@dataclass
class DummyUser:
    id: int = 101
    email: str = 'paciente@test.com'
    username: str = 'Paciente Test'
    role_name: str = 'paciente'
    doctor_profile_id: int | None = None

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.concurrency import run_in_threadpool
from fastapi_pagination import add_pagination

from app.core.config import settings
from app.scripts.create_admin import create_default_admin
from app.scripts.seeds import init_db 

from app.api.v1 import (
    auth, 
    #users, 
    clinics, specialties, audit
)
from app.api.v1 import (
    patients_profile, doctor_profile, staff_profile, insurance
)
from app.core.redis_service import redis_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando MedSaaS API...")
    try:
        print("Conectando a Redis...")
        await redis_service.init_redis()
        print("Conexión a Redis exitosa")
    except Exception as e:
        print(f"Error al conectar con Redis: {e}")

    print("Verificando datos semilla (Roles)")
    await run_in_threadpool(init_db)

    print("Verificando usuario SuperAdmin")
    await run_in_threadpool(create_default_admin)
    
    print("Verificación de arranque exitosa")
    
    yield
    
    print("Apagando MedSaaS API")

app = FastAPI(
    title="MedSaaS API",
    lifespan=lifespan,
    description="API Multitenant para Gestión de Clínicas y Consultorios Médicos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación y Seguridad"])
#app.include_router(users.router, prefix="/api/v1/users", tags=["Gestión de Usuarios"])
app.include_router(clinics.router, prefix="/api/v1/clinics", tags=["Gestión de Clínicas (Tenants)"])
app.include_router(specialties.router, prefix="/api/v1/specialties", tags=["Catálogo de Especialidades"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Auditoría de Sistema"])

app.include_router(patients_profile.router, prefix="/api/v1/profiles/patients", tags=["Perfiles - Pacientes"])
app.include_router(doctor_profile.router, prefix="/api/v1/profiles/doctors", tags=["Perfiles - Doctores"])
app.include_router(staff_profile.router, prefix="/api/v1/profiles/staff", tags=["Perfiles - Personal"])
app.include_router(insurance.router, prefix="/api/v1/profiles/insurances", tags=["Perfiles - Seguros"])

add_pagination(app)
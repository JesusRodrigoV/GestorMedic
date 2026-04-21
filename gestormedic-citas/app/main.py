from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, doctor, patient, public, reports
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Ya no ejecutamos create_all aquí para evitar conflictos con el backend central
    # Las migraciones se gestionan centralizadamente mediante Alembic o el backend principal
    yield


app = FastAPI(
    title='GestorMedic Citas API',
    version='1.0.0',
    description='Microservicio de agenda y citas para GestorMedic',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(public.router, prefix=settings.API_V1_STR)
app.include_router(patient.router, prefix=settings.API_V1_STR)
app.include_router(doctor.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)


@app.get('/health')
async def health():
    return {'status': 'ok'}

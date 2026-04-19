from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import doctor, internal, patient
from app.core.config import settings
from app.db.mongo import database
from app.services.histories_service import ensure_indexes


@asynccontextmanager
async def lifespan(_: FastAPI):
    await ensure_indexes(database)
    yield


app = FastAPI(
    title='GestorMedic Historiales API',
    version='1.0.0',
    description='Microservicio de historiales medicos y archivos clinicos',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(patient.router, prefix=settings.API_V1_STR)
app.include_router(doctor.router, prefix=settings.API_V1_STR)
app.include_router(internal.router, prefix=settings.API_V1_STR)


@app.get('/health')
async def health():
    return {'status': 'ok'}

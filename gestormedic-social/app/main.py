from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.core.config import settings
from app.db.session import engine, Base

@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title='GestorMedic Social API',
    version='1.0.0',
    description='Microservicio de Red Social Médica para GestorMedic',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(endpoints.router, prefix=settings.API_V1_STR)

@app.get('/health')
async def health():
    return {'status': 'ok'}

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, public, subscription
from app.core.config import settings
from app.db.base import Base
from app.db.bootstrap import apply_sql_file
from app.db.session import SessionLocal, engine
from app.services.freemium_service import ensure_default_catalog


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        sql_path = Path(__file__).parent / 'db' / 'sql' / 'freemium_performance_indexes.sql'
        await apply_sql_file(conn, sql_path)

    async with SessionLocal() as session:
        await ensure_default_catalog(session)
        await session.commit()

    yield


app = FastAPI(
    title='GestorMedic Freemium Service',
    version='1.0.0',
    description='Microservicio de suscripciones freemium y pagos simulados',
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
app.include_router(subscription.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)


@app.get('/health')
async def health():
    return {'status': 'ok'}

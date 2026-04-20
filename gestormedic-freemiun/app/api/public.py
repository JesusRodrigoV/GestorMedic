from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.freemium import PlanCatalog
from app.schemas.freemium import PlanCatalogOut


router = APIRouter(prefix='/plans', tags=['freemium-public'])


@router.get('/catalog', response_model=list[PlanCatalogOut])
async def list_plan_catalog(
    role_name: str | None = Query(default=None),
    billing_cycle: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(PlanCatalog).where(PlanCatalog.is_active.is_(True))

    if role_name:
        stmt = stmt.where(PlanCatalog.role_name == role_name.lower())
    if billing_cycle:
        stmt = stmt.where(PlanCatalog.billing_cycle == billing_cycle.lower())

    stmt = stmt.order_by(PlanCatalog.role_name.asc(), PlanCatalog.price_cents.asc())
    return (await db.execute(stmt)).scalars().all()

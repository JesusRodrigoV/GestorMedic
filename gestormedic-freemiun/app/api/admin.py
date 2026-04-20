from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_superadmin
from app.db.session import get_db
from app.models.external import Role, User
from app.models.freemium import Payment, UserSubscription, WalletLedger
from app.schemas.freemium import (
    FinancialSummaryOut,
    PaginatedResponse,
    PaymentOut,
    SubscriptionStatsOut,
    UserSubscriptionRow,
)
from app.services.freemium_service import build_sort_column


router = APIRouter(prefix='/admin', tags=['freemium-admin'])


@router.get('/users/subscriptions', response_model=PaginatedResponse)
async def list_users_subscriptions(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    sortBy: str = Query('created_at'),
    sortType: str = Query('desc', pattern='^(asc|desc)$'),
    filter: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_superadmin),
):
    stmt = (
        select(User.id, User.username, User.email, User.is_active, User.created_at, Role.name)
        .join(Role, Role.id == User.role_id)
        .where(Role.name.in_(['paciente', 'medico', 'ADMIN_CLINICA']))
    )

    if filter:
        search_filter = f'%{filter.strip()}%'
        stmt = stmt.where(or_(User.email.ilike(search_filter), User.username.ilike(search_filter)))

    total = (
        await db.execute(select(func.count()).select_from(stmt.subquery()))
    ).scalar_one()

    order_column = build_sort_column(sortBy)
    stmt = stmt.order_by(order_column.asc() if sortType == 'asc' else order_column.desc())

    skip = (page - 1) * pageSize
    rows = (await db.execute(stmt.offset(skip).limit(pageSize))).all()

    now = datetime.now(UTC)
    items: list[UserSubscriptionRow] = []
    for row in rows:
        sub = (
            await db.execute(
                select(UserSubscription)
                .where(
                    and_(
                        UserSubscription.user_id == row.id,
                        UserSubscription.status == 'active',
                        UserSubscription.ends_at >= now,
                    )
                )
                .order_by(UserSubscription.created_at.desc())
                .limit(1)
            )
        ).scalar_one_or_none()

        items.append(
            UserSubscriptionRow(
                user_id=row.id,
                username=row.username,
                email=row.email,
                role_name=(row.name or '').lower(),
                is_active=row.is_active,
                plan_code=sub.plan_code if sub else 'free',
                billing_cycle=sub.billing_cycle if sub else 'monthly',
                subscription_status=sub.status if sub else 'active',
                next_billing_at=sub.next_billing_at if sub else None,
            )
        )

    return {
        'items': items,
        'metadata': {
            'total': int(total),
            'page': page,
            'pageSize': pageSize,
            'skip': skip,
            'limit': pageSize,
            'total_pages': (int(total) + pageSize - 1) // pageSize,
        },
    }


@router.get('/financial/summary', response_model=FinancialSummaryOut)
async def get_financial_summary(
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_superadmin),
):
    total_payments = (await db.execute(select(func.count(Payment.id)))).scalar_one() or 0
    total_revenue = (await db.execute(select(func.coalesce(func.sum(Payment.amount_cents), 0)))).scalar_one() or 0

    now = datetime.now(UTC)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_revenue = (
        await db.execute(
            select(func.coalesce(func.sum(Payment.amount_cents), 0)).where(Payment.paid_at >= month_start)
        )
    ).scalar_one() or 0

    wallet_balance = (
        await db.execute(select(WalletLedger.balance_after_cents).order_by(WalletLedger.id.desc()).limit(1))
    ).scalar_one_or_none()

    return FinancialSummaryOut(
        total_payments=int(total_payments),
        total_revenue_cents=int(total_revenue),
        month_revenue_cents=int(month_revenue),
        wallet_balance_cents=int(wallet_balance or 0),
    )


@router.get('/payments', response_model=PaginatedResponse)
async def list_payments(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_superadmin),
):
    total = (await db.execute(select(func.count(Payment.id)))).scalar_one() or 0
    skip = (page - 1) * pageSize

    rows = (
        await db.execute(select(Payment).order_by(Payment.paid_at.desc()).offset(skip).limit(pageSize))
    ).scalars().all()

    return {
        'items': [PaymentOut.model_validate(item) for item in rows],
        'metadata': {
            'total': int(total),
            'page': page,
            'pageSize': pageSize,
            'skip': skip,
            'limit': pageSize,
            'total_pages': (int(total) + pageSize - 1) // pageSize,
        },
    }


@router.get('/subscriptions/stats', response_model=SubscriptionStatsOut)
async def get_subscription_stats(
    db: AsyncSession = Depends(get_db),
    _: CurrentUser = Depends(require_superadmin),
):
    now = datetime.now(UTC)
    active_stmt = select(UserSubscription).where(
        UserSubscription.status == 'active',
        UserSubscription.ends_at >= now,
    )
    active_rows = (await db.execute(active_stmt)).scalars().all()

    by_plan: dict[str, int] = {}
    by_role: dict[str, int] = {}

    for row in active_rows:
        by_plan[row.plan_code] = by_plan.get(row.plan_code, 0) + 1
        by_role[row.role_name] = by_role.get(row.role_name, 0) + 1

    return SubscriptionStatsOut(active_by_plan=by_plan, active_by_role=by_role)

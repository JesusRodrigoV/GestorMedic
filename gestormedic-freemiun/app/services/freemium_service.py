from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.external import Role, User
from app.models.freemium import Payment, PlanCatalog, UsageCounter, UserSubscription, WalletLedger


DEFAULT_PLAN_CATALOG: list[dict] = [
    {
        'role_name': 'paciente',
        'plan_code': 'free',
        'billing_cycle': 'monthly',
        'display_name': 'Paciente Free',
        'description': 'Acceso basico para pacientes.',
        'price_cents': 0,
        'currency': 'USD',
        'limits_json': {'monthly_appointments': 2, 'records_views': 15},
    },
    {
        'role_name': 'paciente',
        'plan_code': 'plus',
        'billing_cycle': 'monthly',
        'display_name': 'Paciente Plus',
        'description': 'Mayor capacidad de agenda y consultas.',
        'price_cents': 990,
        'currency': 'USD',
        'limits_json': {'monthly_appointments': 10, 'records_views': 200},
    },
    {
        'role_name': 'paciente',
        'plan_code': 'plus',
        'billing_cycle': 'annual',
        'display_name': 'Paciente Plus Anual',
        'description': 'Plan anual con descuento.',
        'price_cents': 9990,
        'currency': 'USD',
        'limits_json': {'monthly_appointments': 10, 'records_views': 200},
    },
    {
        'role_name': 'medico',
        'plan_code': 'free',
        'billing_cycle': 'monthly',
        'display_name': 'Medico Free',
        'description': 'Capacidad inicial para consulta.',
        'price_cents': 0,
        'currency': 'USD',
        'limits_json': {'monthly_consults': 20, 'telemedicine_minutes': 120},
    },
    {
        'role_name': 'medico',
        'plan_code': 'pro',
        'billing_cycle': 'monthly',
        'display_name': 'Medico Pro',
        'description': 'Mayor capacidad para telemedicina y agenda.',
        'price_cents': 2490,
        'currency': 'USD',
        'limits_json': {'monthly_consults': 120, 'telemedicine_minutes': 2000},
    },
    {
        'role_name': 'medico',
        'plan_code': 'pro',
        'billing_cycle': 'annual',
        'display_name': 'Medico Pro Anual',
        'description': 'Plan anual para medicos.',
        'price_cents': 24900,
        'currency': 'USD',
        'limits_json': {'monthly_consults': 120, 'telemedicine_minutes': 2000},
    },
    {
        'role_name': 'admin_clinica',
        'plan_code': 'free',
        'billing_cycle': 'monthly',
        'display_name': 'Clinica Free',
        'description': 'Plan inicial para clinicas pequenas.',
        'price_cents': 0,
        'currency': 'USD',
        'limits_json': {'monthly_patients': 150, 'team_members': 3},
    },
    {
        'role_name': 'admin_clinica',
        'plan_code': 'business',
        'billing_cycle': 'monthly',
        'display_name': 'Clinica Business',
        'description': 'Escalamiento para operacion completa.',
        'price_cents': 6990,
        'currency': 'USD',
        'limits_json': {'monthly_patients': 2500, 'team_members': 40},
    },
    {
        'role_name': 'admin_clinica',
        'plan_code': 'business',
        'billing_cycle': 'annual',
        'display_name': 'Clinica Business Anual',
        'description': 'Plan anual empresarial.',
        'price_cents': 69900,
        'currency': 'USD',
        'limits_json': {'monthly_patients': 2500, 'team_members': 40},
    },
]


def period_key_from_date(dt: datetime) -> str:
    return dt.strftime('%Y-%m')


def next_billing_date(from_dt: datetime, cycle: str) -> datetime:
    if cycle == 'annual':
        return from_dt.replace(year=from_dt.year + 1)

    if from_dt.month == 12:
        return from_dt.replace(year=from_dt.year + 1, month=1)
    return from_dt.replace(month=from_dt.month + 1)


async def ensure_default_catalog(db: AsyncSession) -> None:
    existing = (await db.execute(select(func.count(PlanCatalog.id)))).scalar_one()
    if existing and existing > 0:
        return

    for item in DEFAULT_PLAN_CATALOG:
        db.add(PlanCatalog(**item))
    await db.flush()


async def get_current_subscription(db: AsyncSession, user_id: int) -> UserSubscription | None:
    now = datetime.now(UTC)
    stmt = (
        select(UserSubscription)
        .where(
            UserSubscription.user_id == user_id,
            UserSubscription.status == 'active',
            UserSubscription.ends_at >= now,
        )
        .order_by(UserSubscription.created_at.desc())
        .limit(1)
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def get_or_create_free_subscription(
    db: AsyncSession,
    user_id: int,
    role_name: str,
) -> UserSubscription:
    current = await get_current_subscription(db, user_id)
    if current:
        return current

    free_plan_stmt = select(PlanCatalog).where(
        PlanCatalog.role_name == role_name,
        PlanCatalog.plan_code == 'free',
        PlanCatalog.billing_cycle == 'monthly',
        PlanCatalog.is_active.is_(True),
    )
    free_plan = (await db.execute(free_plan_stmt)).scalar_one_or_none()
    if not free_plan:
        raise ValueError(f'No existe plan free para rol {role_name}')

    now = datetime.now(UTC)
    subscription = UserSubscription(
        user_id=user_id,
        role_name=role_name,
        plan_code=free_plan.plan_code,
        billing_cycle=free_plan.billing_cycle,
        status='active',
        starts_at=now,
        ends_at=next_billing_date(now, free_plan.billing_cycle),
        next_billing_at=next_billing_date(now, free_plan.billing_cycle),
        auto_renew=True,
        metadata_json={'source': 'auto-free-bootstrap'},
    )
    db.add(subscription)
    await db.flush()
    return subscription


async def get_effective_limits(db: AsyncSession, role_name: str, plan_code: str, billing_cycle: str) -> dict[str, int]:
    stmt = select(PlanCatalog.limits_json).where(
        PlanCatalog.role_name == role_name,
        PlanCatalog.plan_code == plan_code,
        PlanCatalog.billing_cycle == billing_cycle,
        PlanCatalog.is_active.is_(True),
    )
    limits = (await db.execute(stmt)).scalar_one_or_none()
    return dict(limits or {})


async def get_usage_for_period(db: AsyncSession, user_id: int, period_key: str) -> dict[str, int]:
    stmt = select(UsageCounter).where(UsageCounter.user_id == user_id, UsageCounter.period_key == period_key)
    rows = (await db.execute(stmt)).scalars().all()
    return {item.feature_key: item.used_count for item in rows}


async def consume_limit_feature(
    db: AsyncSession,
    user_id: int,
    feature_key: str,
    units: int,
    limits: dict[str, int],
) -> tuple[bool, int, int]:
    if units <= 0:
        raise ValueError('units debe ser mayor a 0')

    limit_value = limits.get(feature_key)
    if limit_value is None:
        raise ValueError(f'No existe limite para feature {feature_key}')

    period_key = period_key_from_date(datetime.now(UTC))
    stmt = select(UsageCounter).where(
        UsageCounter.user_id == user_id,
        UsageCounter.feature_key == feature_key,
        UsageCounter.period_key == period_key,
    )
    counter = (await db.execute(stmt)).scalar_one_or_none()
    if not counter:
        counter = UsageCounter(
            user_id=user_id,
            feature_key=feature_key,
            period_key=period_key,
            used_count=0,
        )
        db.add(counter)
        await db.flush()

    next_value = counter.used_count + units
    if next_value > limit_value:
        remaining = max(limit_value - counter.used_count, 0)
        return False, counter.used_count, remaining

    counter.used_count = next_value
    await db.flush()
    remaining = max(limit_value - next_value, 0)
    return True, next_value, remaining


async def simulate_checkout(
    db: AsyncSession,
    user: User,
    role_name: str,
    plan: PlanCatalog,
) -> tuple[Payment, UserSubscription]:
    if plan.role_name != role_name:
        raise ValueError('El plan seleccionado no aplica para el rol actual')

    now = datetime.now(UTC)
    payment = Payment(
        user_id=user.id,
        amount_cents=plan.price_cents,
        currency=plan.currency,
        status='paid',
        provider='simulator',
        provider_ref=f'SIM-{uuid4().hex[:16].upper()}',
        paid_at=now,
    )
    db.add(payment)
    await db.flush()

    active_stmt = select(UserSubscription).where(
        UserSubscription.user_id == user.id,
        UserSubscription.status == 'active',
    )
    active_subs = (await db.execute(active_stmt)).scalars().all()
    for item in active_subs:
        item.status = 'replaced'

    starts_at = now
    next_bill = next_billing_date(starts_at, plan.billing_cycle)
    subscription = UserSubscription(
        user_id=user.id,
        role_name=role_name,
        plan_code=plan.plan_code,
        billing_cycle=plan.billing_cycle,
        status='active',
        starts_at=starts_at,
        ends_at=next_bill,
        next_billing_at=next_bill,
        auto_renew=True,
        metadata_json={'source': 'simulated-payment', 'payment_id': payment.id},
    )
    db.add(subscription)
    await db.flush()

    payment.subscription_id = subscription.id

    current_balance = (
        await db.execute(select(WalletLedger.balance_after_cents).order_by(WalletLedger.id.desc()).limit(1))
    ).scalar_one_or_none()
    if current_balance is None:
        current_balance = 0
    new_balance = current_balance + payment.amount_cents

    db.add(
        WalletLedger(
            entry_type='credit',
            amount_cents=payment.amount_cents,
            balance_after_cents=new_balance,
            reference=f'payment:{payment.provider_ref}',
            payment_id=payment.id,
        )
    )
    await db.flush()

    return payment, subscription


async def get_role_name(db: AsyncSession, user_id: int) -> str:
    stmt = (
        select(Role.name)
        .join(User, User.role_id == Role.id)
        .where(User.id == user_id)
        .limit(1)
    )
    role_name = (await db.execute(stmt)).scalar_one_or_none()
    return (role_name or '').lower()


def normalize_role_name(role_name: str) -> str:
    return (role_name or '').strip().lower()


def build_sort_column(sort_by: str):
    sort_map = {
        'created_at': User.created_at,
        'email': User.email,
        'username': User.username,
    }
    return sort_map.get(sort_by, User.created_at)


def build_role_filter_query(search_filter: str):
    return or_(
        User.email.ilike(search_filter),
        User.username.ilike(search_filter),
    )

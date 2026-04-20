from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, require_freemium_user
from app.db.session import get_db
from app.models.external import User
from app.models.freemium import PlanCatalog
from app.schemas.freemium import (
    CheckoutSimulationIn,
    CheckoutSimulationOut,
    EntitlementSnapshotOut,
    SubscriptionOut,
    UsageConsumeIn,
    UsageConsumeOut,
)
from app.services.freemium_service import (
    consume_limit_feature,
    get_effective_limits,
    get_or_create_free_subscription,
    get_usage_for_period,
    normalize_role_name,
    period_key_from_date,
    simulate_checkout,
)


router = APIRouter(prefix='/subscriptions', tags=['freemium-subscriptions'])


@router.get('/me', response_model=SubscriptionOut)
async def get_my_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_freemium_user),
):
    role_name = normalize_role_name(current_user.role_name)
    sub = await get_or_create_free_subscription(db, current_user.id, role_name)
    return sub


@router.get('/me/entitlements', response_model=EntitlementSnapshotOut)
async def get_my_entitlements(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_freemium_user),
):
    role_name = normalize_role_name(current_user.role_name)
    sub = await get_or_create_free_subscription(db, current_user.id, role_name)
    limits = await get_effective_limits(db, role_name, sub.plan_code, sub.billing_cycle)
    usage = await get_usage_for_period(db, current_user.id, period_key_from_date(datetime.now(UTC)))

    remaining = {feature: max(limit - usage.get(feature, 0), 0) for feature, limit in limits.items()}

    return EntitlementSnapshotOut(
        plan_code=sub.plan_code,
        billing_cycle=sub.billing_cycle,
        limits=limits,
        usage=usage,
        remaining=remaining,
    )


@router.post('/checkout/simulate', response_model=CheckoutSimulationOut)
async def simulate_checkout_payment(
    payload: CheckoutSimulationIn,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_freemium_user),
):
    plan_stmt = select(PlanCatalog).where(PlanCatalog.id == payload.plan_id, PlanCatalog.is_active.is_(True))
    plan = (await db.execute(plan_stmt)).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Plan no encontrado')

    role_name = normalize_role_name(current_user.role_name)
    user = (await db.execute(select(User).where(User.id == current_user.id))).scalar_one()

    try:
        payment, subscription = await simulate_checkout(db, user, role_name, plan)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return CheckoutSimulationOut(
        payment_id=payment.id,
        provider_ref=payment.provider_ref,
        subscription_id=subscription.id,
        plan_code=subscription.plan_code,
        billing_cycle=subscription.billing_cycle,
        amount_cents=payment.amount_cents,
        currency=payment.currency,
        paid_at=payment.paid_at,
    )


@router.post('/usage/consume', response_model=UsageConsumeOut)
async def consume_usage(
    payload: UsageConsumeIn,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_freemium_user),
):
    role_name = normalize_role_name(current_user.role_name)
    sub = await get_or_create_free_subscription(db, current_user.id, role_name)
    limits = await get_effective_limits(db, role_name, sub.plan_code, sub.billing_cycle)

    try:
        allowed, used, remaining = await consume_limit_feature(
            db,
            user_id=current_user.id,
            feature_key=payload.feature_key,
            units=payload.units,
            limits=limits,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    message = 'Uso registrado correctamente' if allowed else 'Limite mensual alcanzado para esta funcionalidad'
    return UsageConsumeOut(allowed=allowed, used_count=used, remaining=remaining, message=message)

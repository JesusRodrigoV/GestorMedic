from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class PlanCatalogOut(BaseModel):
    id: int
    role_name: str
    plan_code: str
    billing_cycle: str
    display_name: str
    description: str | None = None
    price_cents: int
    currency: str
    limits_json: dict[str, int]

    model_config = ConfigDict(from_attributes=True)


class SubscriptionOut(BaseModel):
    id: int
    user_id: int
    role_name: str
    plan_code: str
    billing_cycle: str
    status: str
    starts_at: datetime
    ends_at: datetime
    next_billing_at: datetime
    auto_renew: bool

    model_config = ConfigDict(from_attributes=True)


class CheckoutSimulationIn(BaseModel):
    plan_id: int


class CheckoutSimulationOut(BaseModel):
    payment_id: int
    provider_ref: str
    subscription_id: int
    plan_code: str
    billing_cycle: str
    amount_cents: int
    currency: str
    paid_at: datetime


class UsageConsumeIn(BaseModel):
    feature_key: str
    units: int = 1


class UsageConsumeOut(BaseModel):
    allowed: bool
    used_count: int
    remaining: int
    message: str


class EntitlementSnapshotOut(BaseModel):
    plan_code: str
    billing_cycle: str
    limits: dict[str, int]
    usage: dict[str, int]
    remaining: dict[str, int]


class UserSubscriptionRow(BaseModel):
    user_id: int
    username: str
    email: str
    role_name: str
    is_active: bool
    plan_code: str
    billing_cycle: str
    subscription_status: str
    next_billing_at: datetime | None = None


class PaginatedResponse(BaseModel):
    items: list[Any]
    metadata: dict[str, int]


class FinancialSummaryOut(BaseModel):
    total_payments: int
    total_revenue_cents: int
    month_revenue_cents: int
    wallet_balance_cents: int


class SubscriptionStatsOut(BaseModel):
    active_by_plan: dict[str, int]
    active_by_role: dict[str, int]


class PaymentOut(BaseModel):
    id: int
    user_id: int
    amount_cents: int
    currency: str
    status: str
    provider: str
    provider_ref: str
    paid_at: datetime

    model_config = ConfigDict(from_attributes=True)

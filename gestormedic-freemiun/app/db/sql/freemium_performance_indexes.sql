-- Indices de rendimiento para tablas freemium (House6-local / PostgreSQL)
-- Script idempotente: se puede ejecutar multiples veces sin error.

CREATE INDEX IF NOT EXISTS ix_freemium_plan_catalog_role_cycle_active
ON freemium_plan_catalog (role_name, billing_cycle, is_active);

CREATE INDEX IF NOT EXISTS ix_freemium_user_subscriptions_user_status_ends
ON freemium_user_subscriptions (user_id, status, ends_at DESC);

CREATE INDEX IF NOT EXISTS ix_freemium_user_subscriptions_role_plan_status
ON freemium_user_subscriptions (role_name, plan_code, status);

CREATE INDEX IF NOT EXISTS ix_freemium_user_subscriptions_next_billing
ON freemium_user_subscriptions (next_billing_at)
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS ix_freemium_payments_paid_at
ON freemium_payments (paid_at DESC);

CREATE INDEX IF NOT EXISTS ix_freemium_payments_user_paid_at
ON freemium_payments (user_id, paid_at DESC);

CREATE INDEX IF NOT EXISTS ix_freemium_wallet_ledger_created_at
ON freemium_wallet_ledger (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_freemium_usage_counters_user_period
ON freemium_usage_counters (user_id, period_key);

CREATE INDEX IF NOT EXISTS ix_freemium_usage_counters_feature_period
ON freemium_usage_counters (feature_key, period_key);

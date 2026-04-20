export interface PlanCatalog {
  id: number;
  role_name: string;
  plan_code: string;
  billing_cycle: 'monthly' | 'annual';
  display_name: string;
  description?: string;
  price_cents: number;
  currency: string;
  limits_json: Record<string, number>;
}

export interface Subscription {
  id: number;
  user_id: number;
  role_name: string;
  plan_code: string;
  billing_cycle: 'monthly' | 'annual';
  status: string;
  starts_at: string;
  ends_at: string;
  next_billing_at: string;
  auto_renew: boolean;
}

export interface EntitlementsSnapshot {
  plan_code: string;
  billing_cycle: 'monthly' | 'annual';
  limits: Record<string, number>;
  usage: Record<string, number>;
  remaining: Record<string, number>;
}

export interface CheckoutResult {
  payment_id: number;
  provider_ref: string;
  subscription_id: number;
  plan_code: string;
  billing_cycle: 'monthly' | 'annual';
  amount_cents: number;
  currency: string;
  paid_at: string;
}

export interface UsageConsumeResult {
  allowed: boolean;
  used_count: number;
  remaining: number;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    skip: number;
    limit: number;
    total_pages: number;
  };
}

export interface UserSubscriptionRow {
  user_id: number;
  username: string;
  email: string;
  role_name: string;
  is_active: boolean;
  plan_code: string;
  billing_cycle: string;
  subscription_status: string;
  next_billing_at?: string;
}

export interface FinancialSummary {
  total_payments: number;
  total_revenue_cents: number;
  month_revenue_cents: number;
  wallet_balance_cents: number;
}

export interface SubscriptionStats {
  active_by_plan: Record<string, number>;
  active_by_role: Record<string, number>;
}

export interface PaymentRow {
  id: number;
  user_id: number;
  amount_cents: number;
  currency: string;
  status: string;
  provider: string;
  provider_ref: string;
  paid_at: string;
}

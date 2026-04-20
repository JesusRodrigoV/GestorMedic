import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CheckoutResult,
  EntitlementsSnapshot,
  FinancialSummary,
  PaginatedResponse,
  PaymentRow,
  PlanCatalog,
  Subscription,
  SubscriptionStats,
  UsageConsumeResult,
  UserSubscriptionRow,
} from '@core/models/freemium.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FreemiumService {
  private http = inject(HttpClient);
  private apiUrl = environment.freemiumApiUrl;

  private readonly httpOptions = {
    withCredentials: true,
  };

  getCatalog(role_name?: string): Observable<PlanCatalog[]> {
    return this.http.get<PlanCatalog[]>(`${this.apiUrl}/plans/catalog`, {
      params: role_name ? { role_name } : {},
      ...this.httpOptions,
    });
  }

  getMySubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/subscriptions/me`, this.httpOptions);
  }

  getMyEntitlements(): Observable<EntitlementsSnapshot> {
    return this.http.get<EntitlementsSnapshot>(`${this.apiUrl}/subscriptions/me/entitlements`, this.httpOptions);
  }

  simulateCheckout(planId: number): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>(
      `${this.apiUrl}/subscriptions/checkout/simulate`,
      { plan_id: planId },
      this.httpOptions,
    );
  }

  consumeFeature(featureKey: string, units = 1): Observable<UsageConsumeResult> {
    return this.http.post<UsageConsumeResult>(
      `${this.apiUrl}/subscriptions/usage/consume`,
      { feature_key: featureKey, units },
      this.httpOptions,
    );
  }

  getUsersSubscriptions(params: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortType: 'asc' | 'desc';
    filter?: string;
  }): Observable<PaginatedResponse<UserSubscriptionRow>> {
    return this.http.get<PaginatedResponse<UserSubscriptionRow>>(`${this.apiUrl}/admin/users/subscriptions`, {
      params: params as Record<string, string | number>,
      ...this.httpOptions,
    });
  }

  getFinancialSummary(): Observable<FinancialSummary> {
    return this.http.get<FinancialSummary>(`${this.apiUrl}/admin/financial/summary`, this.httpOptions);
  }

  getSubscriptionStats(): Observable<SubscriptionStats> {
    return this.http.get<SubscriptionStats>(`${this.apiUrl}/admin/subscriptions/stats`, this.httpOptions);
  }

  getPayments(page = 1, pageSize = 10): Observable<PaginatedResponse<PaymentRow>> {
    return this.http.get<PaginatedResponse<PaymentRow>>(`${this.apiUrl}/admin/payments`, {
      params: { page, pageSize },
      ...this.httpOptions,
    });
  }
}

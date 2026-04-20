import { CurrencyPipe, DatePipe, KeyValuePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FreemiumService } from '@core/services/freemium.service';
import { NotificationService } from '@core/services/notification';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscription-plans',
  imports: [CurrencyPipe, DatePipe, KeyValuePipe, TitleCasePipe, UpperCasePipe, FormsModule],
  templateUrl: './subscription-plans.html',
  styleUrl: './subscription-plans.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SubscriptionPlans {
  private freemium = inject(FreemiumService);
  private notifications = inject(NotificationService);

  protected summary = signal<any | null>(null);
  protected stats = signal<any | null>(null);
  protected users = signal<any[]>([]);
  protected payments = signal<any[]>([]);

  protected usersPage = signal(1);
  protected usersPageSize = signal(10);
  protected usersTotal = signal(0);
  protected usersSortBy = signal('created_at');
  protected usersSortType = signal<'asc' | 'desc'>('desc');
  protected usersFilter = signal('');

  protected paymentsPage = signal(1);
  protected paymentsPageSize = signal(10);

  constructor() {
    this.reloadAll();
  }

  protected reloadAll(): void {
    this.freemium.getFinancialSummary().subscribe({
      next: (data) => this.summary.set(data),
      error: () => this.notifyLoadError(),
    });

    this.freemium.getSubscriptionStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => this.notifyLoadError(),
    });

    this.loadUsers();
    this.loadPayments();
  }

  protected onUsersFilterChange(value: string): void {
    this.usersFilter.set(value);
    this.usersPage.set(1);
    this.loadUsers();
  }

  protected onUsersSortChange(field: string): void {
    if (this.usersSortBy() === field) {
      this.usersSortType.set(this.usersSortType() === 'asc' ? 'desc' : 'asc');
    } else {
      this.usersSortBy.set(field);
      this.usersSortType.set('asc');
    }
    this.loadUsers();
  }

  protected nextUsersPage(): void {
    const next = this.usersPage() + 1;
    const maxPage = Math.max(1, Math.ceil(this.usersTotal() / this.usersPageSize()));
    if (next <= maxPage) {
      this.usersPage.set(next);
      this.loadUsers();
    }
  }

  protected prevUsersPage(): void {
    if (this.usersPage() > 1) {
      this.usersPage.set(this.usersPage() - 1);
      this.loadUsers();
    }
  }

  protected nextPaymentsPage(): void {
    this.paymentsPage.set(this.paymentsPage() + 1);
    this.loadPayments();
  }

  protected prevPaymentsPage(): void {
    if (this.paymentsPage() > 1) {
      this.paymentsPage.set(this.paymentsPage() - 1);
      this.loadPayments();
    }
  }

  private loadUsers(): void {
    this.freemium
      .getUsersSubscriptions({
        page: this.usersPage(),
        pageSize: this.usersPageSize(),
        sortBy: this.usersSortBy(),
        sortType: this.usersSortType(),
        filter: this.usersFilter().trim() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.users.set(response.items);
          this.usersTotal.set(response.metadata.total);
        },
        error: () => this.notifyLoadError(),
      });
  }

  private loadPayments(): void {
    this.freemium.getPayments(this.paymentsPage(), this.paymentsPageSize()).subscribe({
      next: (response) => this.payments.set(response.items),
      error: () => this.notifyLoadError(),
    });
  }

  private notifyLoadError(): void {
    this.notifications
      .builder()
      .error()
      .summary('No se pudo cargar Freemium Service')
      .detail('Verifica permisos de superadmin y disponibilidad del microservicio.')
      .show();
  }
}

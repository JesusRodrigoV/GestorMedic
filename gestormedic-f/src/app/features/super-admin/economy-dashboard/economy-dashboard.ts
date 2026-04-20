import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FreemiumService } from '@core/services/freemium.service';
import { NotificationService } from '@core/services/notification';

@Component({
  selector: 'gm-economy-dashboard',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './economy-dashboard.html',
  styleUrl: './economy-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EconomyDashboard {
  private freemium = inject(FreemiumService);
  private notifications = inject(NotificationService);

  protected summary = signal<any | null>(null);
  protected payments = signal<any[]>([]);
  protected page = signal(1);
  protected pageSize = signal(10);

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.freemium.getFinancialSummary().subscribe({
      next: (data) => this.summary.set(data),
      error: () => this.notifyError(),
    });

    this.freemium.getPayments(this.page(), this.pageSize()).subscribe({
      next: (response) => this.payments.set(response.items),
      error: () => this.notifyError(),
    });
  }

  protected nextPage(): void {
    this.page.set(this.page() + 1);
    this.reload();
  }

  protected prevPage(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.reload();
    }
  }

  private notifyError(): void {
    this.notifications
      .builder()
      .error()
      .summary('No se pudo cargar economía')
      .detail('Revisa el estado del microservicio freemium.')
      .show();
  }
}

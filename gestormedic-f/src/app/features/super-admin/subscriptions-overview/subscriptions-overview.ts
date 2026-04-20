import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { KeyValuePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { FreemiumService } from '@core/services/freemium.service';
import { NotificationService } from '@core/services/notification';

@Component({
  selector: 'gm-subscriptions-overview',
  imports: [KeyValuePipe, TitleCasePipe, UpperCasePipe],
  templateUrl: './subscriptions-overview.html',
  styleUrl: './subscriptions-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SubscriptionsOverview {
  private freemium = inject(FreemiumService);
  private notifications = inject(NotificationService);

  protected stats = signal<any | null>(null);

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.freemium.getSubscriptionStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => {
        this.notifications
          .builder()
          .error()
          .summary('No se pudo cargar suscripciones')
          .detail('Revisa permisos y estado del servicio freemium.')
          .show();
      },
    });
  }
}

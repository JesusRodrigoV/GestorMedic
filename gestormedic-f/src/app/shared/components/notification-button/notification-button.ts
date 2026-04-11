import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PopoverModule } from 'primeng/popover';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { NotificationApp } from '@core/services/notification-app';
import { NotificationItem } from '../notification-item/notification-item';

@Component({
  selector: 'gm-notification-button',
  imports: [PopoverModule, OverlayBadgeModule, NotificationItem],
  templateUrl: './notification-button.html',
  styleUrl: './notification-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationButton {
  service = inject(NotificationApp);

  protected onMarkRead(id: string): void {
    this.service.markAsRead(id);
  }

  protected onMarkAll(): void {
    this.service.markAllAsRead();
  }
}

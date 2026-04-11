import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppNotification } from '@core/models/app-notification.model';

@Component({
  selector: 'gm-notification-item',
  imports: [DatePipe],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItem {
  notification = input.required<AppNotification>();
  onRead = output<string>();
}

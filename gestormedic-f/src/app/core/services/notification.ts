import { inject, Injectable, signal } from '@angular/core';
import { NotificationState } from '@core/models/notification.model';
import { ToastBuilder } from '@core/utils/toast-builder';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messageService = inject(MessageService);

  private lastNotificationSignal = signal<NotificationState | null>(null);
  public lastNotification = this.lastNotificationSignal.asReadonly();

  builder(): ToastBuilder {
    return new ToastBuilder(this.messageService);
  }

  clear(key?: string): void {
    this.messageService.clear(key);
  }
}

import { computed, effect, Injectable, signal } from '@angular/core';
import { AppNotification } from '@core/models/app-notification.model';
import { MedicalWorkflow } from '@core/services/medical-workflow';
import { inject } from '@angular/core';
import { AuthStore } from '@features/auth/stores/auth.store';

@Injectable({
  providedIn: 'root',
})
export class NotificationApp {
  private workflow = inject(MedicalWorkflow);
  private authStore = inject(AuthStore);
  private _notifications = signal<AppNotification[]>([]);

  notifications = this._notifications.asReadonly();

  unreadCount = computed(() => this._notifications().filter((n) => !n.isRead).length);

  constructor() {
    effect(() => {
      const user = this.authStore.user();
      if (user) {
        this.refresh();
        return;
      }
      this._notifications.set([]);
    });
  }

  public refresh(): void {
    this.workflow.getNotifications().subscribe({
      next: (items) => {
        this._notifications.set(
          items.map((item) => ({
            id: String(item.id),
            title: item.title,
            description: item.description,
            timestamp: new Date(item.created_at),
            type: item.type,
            isRead: item.is_read,
          })),
        );
      },
      error: () => {
        this._notifications.set([]);
      },
    });
  }

  public markAsRead(id: string): void {
    this.workflow.markNotificationAsRead(Number(id)).subscribe({
      next: () => {
        this._notifications.update((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      },
    });
  }

  public markAllAsRead(): void {
    this.workflow.markAllNotificationsAsRead().subscribe({
      next: () => {
        this._notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
      },
    });
  }
}

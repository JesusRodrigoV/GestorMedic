import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppNotification } from '@core/models/app-notification.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationApp {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  _notifications = signal<AppNotification[]>([]);
  notifications = this._notifications.asReadonly();
  unreadCount = signal(0);

  constructor() {
    this.refresh();
  }

  public refresh(): void {
    this.http.get<{ items: any[], unread_count: number }>(`${this.apiUrl}/me`).subscribe({
      next: (res) => {
        const mapped: AppNotification[] = res.items.map(item => ({
          id: item.id.toString(),
          title: item.title,
          description: item.message,
          timestamp: new Date(item.created_at),
          type: 'info',
          isRead: item.is_read
        }));
        this._notifications.set(mapped);
        this.unreadCount.set(res.unread_count);
      },
      error: (err) => console.error('Error cargando notificaciones:', err)
    });
  }

  public markAsRead(id: string): void {
    this.http.patch(`${this.apiUrl}/${id}/read`, {}).subscribe(() => {
      this._notifications.update((list) =>
        list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      this.unreadCount.update(c => Math.max(0, c - 1));
    });
  }

  public markAllAsRead(): void {
    this.http.post(`${this.apiUrl}/mark-all-read`, {}).subscribe(() => {
      this._notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
      this.unreadCount.set(0);
    });
  }
}

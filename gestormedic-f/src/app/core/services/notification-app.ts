import { computed, Injectable, signal } from '@angular/core';
import { AppNotification } from '@core/models/app-notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationApp {
  _notifications = signal<AppNotification[]>([
    {
      id: '1',
      title: 'Resultado de Laboratorio',
      description: 'Los análisis del paciente Roberto Gómez ya están disponibles.',
      timestamp: new Date(),
      type: 'success',
      isRead: false,
    },
    {
      id: '2',
      title: 'Alerta de Quirófano',
      description: 'La Sala 03 requiere validación de equipo técnico.',
      timestamp: new Date(Date.now() - 3600000),
      type: 'critical',
      isRead: false,
    },
    {
      id: '3',
      title: 'Actualización de Agenda',
      description: 'El Dr. Mendoza ha reprogramado 3 citas para la tarde.',
      timestamp: new Date(Date.now() - 7200000),
      type: 'info',
      isRead: true,
    },
  ]);

  notifications = this._notifications.asReadonly();

  unreadCount = computed(() => this._notifications().filter((n) => !n.isRead).length);

  public markAsRead(id: string): void {
    this._notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  public markAllAsRead(): void {
    this._notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
  }
}

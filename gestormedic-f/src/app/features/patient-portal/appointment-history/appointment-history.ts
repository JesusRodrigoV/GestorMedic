import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainContainer } from '@core/layouts/main-container';
import { AppointmentItem } from '@core/models/appointment.model';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-appointment-history',
  imports: [FormsModule, MainContainer, SelectModule],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppointmentHistory {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  readonly status = signal('');
  readonly appointments = signal<AppointmentItem[]>([]);

  readonly statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Confirmadas', value: 'CONFIRMED' },
    { label: 'Pendientes', value: 'PENDING' },
    { label: 'Completadas', value: 'COMPLETED' },
    { label: 'Canceladas', value: 'CANCELLED' },
  ];

  constructor() {
    this.load();
  }

  onStatusChange(value: string): void {
    this.status.set(value);
    this.load();
  }

  formatWindow(item: AppointmentItem): string {
    const startsAt = new Date(item.starts_at);
    const endsAt = new Date(item.ends_at);
    return `${startsAt.toLocaleDateString()} ${startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  translateStatus(status: string): string {
    const translations: Record<string, string> = {
      CONFIRMED: 'Confirmada',
      PENDING: 'Pendiente',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return translations[status] || status;
  }

  private load(): void {
    const selected = this.status().trim();
    this.appointmentsService.getMyAppointments(selected || undefined).subscribe({
      next: (rows) => this.appointments.set(rows),
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('Fallo de conexión')
          .detail(
            'No se pudo establecer contacto con el registro central. Reintente en unos instantes.',
          )
          .show();
      },
    });
  }
}

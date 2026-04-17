import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentItem } from '@core/models/appointment.model';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';

@Component({
  selector: 'app-appointment-history',
  imports: [FormsModule],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppointmentHistory {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  readonly status = signal('');
  readonly appointments = signal<AppointmentItem[]>([]);

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

  private load(): void {
    const selected = this.status().trim();
    this.appointmentsService.getMyAppointments(selected || undefined).subscribe({
      next: (rows) => this.appointments.set(rows),
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('No se pudo cargar el historial')
          .detail('Intenta nuevamente en unos segundos.')
          .show();
      },
    });
  }
}

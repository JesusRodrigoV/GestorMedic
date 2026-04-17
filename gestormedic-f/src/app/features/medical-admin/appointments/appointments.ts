import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentItem } from '@core/models/appointment.model';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';

@Component({
  selector: 'app-doctor-appointments',
  imports: [FormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DoctorAppointments {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  readonly day = signal(new Date().toISOString().slice(0, 10));
  readonly rows = signal<AppointmentItem[]>([]);

  constructor() {
    this.load();
  }

  onDayChange(value: string): void {
    this.day.set(value);
    this.load();
  }

  formatWindow(item: AppointmentItem): string {
    const starts = new Date(item.starts_at);
    const ends = new Date(item.ends_at);
    return `${starts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${ends.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  private load(): void {
    this.appointmentsService.getDoctorAppointmentsByDay(this.day()).subscribe({
      next: (items) => this.rows.set(items),
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('No se pudo cargar citas del dia')
          .detail('Verifica la fecha seleccionada o vuelve a intentar.')
          .show();
      },
    });
  }
}

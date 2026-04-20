import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppointmentsService } from '@core/services/appointments';
import { AppointmentItem } from '@core/models/appointment.model';

@Component({
  selector: 'app-patient-portal-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PatientPortalDashboard {
  private appointmentsService = inject(AppointmentsService);

  readonly highlights = signal<any[]>([]);
  readonly timeline = signal<any[]>([]);
  readonly nextAppointment = signal<AppointmentItem | null>(null);

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.appointmentsService.getMyAppointments('CONFIRMED').subscribe({
      next: (appointments) => {
        const now = new Date();
        const upcoming = appointments
          .filter(a => new Date(a.starts_at) >= now)
          .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

        if (upcoming.length > 0) {
          const next = upcoming[0];
          this.nextAppointment.set(next);
          const date = new Date(next.starts_at);
          
          this.highlights.set([
            { 
              label: 'Próxima cita', 
              value: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }), 
              detail: `${next.specialty_name} con ${next.doctor_name}` 
            },
            { label: 'Recetas vigentes', value: '0', detail: 'No hay recetas activas' },
            { label: 'Estudios pendientes', value: '0', detail: 'No hay estudios pendientes' },
          ]);
        } else {
          this.highlights.set([
            { label: 'Próxima cita', value: 'N/A', detail: 'No tienes citas programadas' },
            { label: 'Recetas vigentes', value: '0', detail: 'No hay recetas activas' },
            { label: 'Estudios pendientes', value: '0', detail: 'No hay estudios pendientes' },
          ]);
        }

        // Mock timeline based on appointments for now
        this.timeline.set(appointments.slice(0, 3).map(a => ({
          date: new Date(a.starts_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          title: `Cita de ${a.specialty_name}`,
          status: a.status
        })));
      },
      error: () => {
        this.highlights.set([
          { label: 'Error', value: '---', detail: 'No se pudieron cargar los datos' }
        ]);
      }
    });
  }
}

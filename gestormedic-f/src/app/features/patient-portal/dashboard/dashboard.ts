import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainContainer } from '@core/layouts/main-container';
import { AppointmentsService } from '@core/services/appointments';
import { AppointmentItem } from '@core/models/appointment.model';
import { CommonModule } from '@angular/common';

interface DashboardHighlight {
  label: string;
  value: string;
  detail: string;
  icon: string;
  status: 'info' | 'success' | 'warn';
}

@Component({
  selector: 'app-patient-portal-dashboard',
  imports: [RouterLink, MainContainer, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PatientPortalDashboard {
  private appointmentsService = inject(AppointmentsService);

  readonly appointments = signal<AppointmentItem[]>([]);
  readonly isLoading = signal(true);

  readonly nextAppointment = computed(() => {
    const now = new Date();
    return (
      this.appointments()
        .filter((a) => new Date(a.starts_at) >= now && a.status === 'CONFIRMED')
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0] ||
      null
    );
  });

  readonly highlights = computed<DashboardHighlight[]>(() => {
    const next = this.nextAppointment();

    return [
      {
        label: 'Próxima Cita',
        value: next
          ? new Date(next.starts_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Sin programar',
        detail: next
          ? `${next.specialty_name} · ${next.doctor_name}`
          : 'No tiene citas pendientes.',
        icon: 'bx-calendar-check',
        status: next ? 'success' : 'info',
      },
      {
        label: 'Recetas Vigentes',
        value: '0',
        detail: 'No se registran prescripciones activas.',
        icon: 'bx-capsule',
        status: 'info',
      },
      {
        label: 'Estudios Pendientes',
        value: '0',
        detail: 'Todo al día en su historial clínico.',
        icon: 'bx-file',
        status: 'info',
      },
    ];
  });

  readonly recentActivity = computed(() => {
    return this.appointments()
      .slice(0, 4)
      .map((a) => ({
        date: new Date(a.starts_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        title: `Consulta de ${a.specialty_name}`,
        doctor: a.doctor_name,
        status: a.status,
        statusLabel: this.translateStatus(a.status),
      }));
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.appointmentsService.getMyAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 'Confirmada',
      PENDING: 'Pendiente',
      COMPLETED: 'Finalizada',
      CANCELLED: 'Cancelada',
    };
    return map[status] || status;
  }
}

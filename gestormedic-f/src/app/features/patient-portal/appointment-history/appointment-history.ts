import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { MedicalWorkflow } from '@core/services/medical-workflow';
import { NotificationService } from '@core/services/notification';

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, AvatarModule],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppointmentHistory {
  private workflow = inject(MedicalWorkflow);
  private notification = inject(NotificationService);

  history = signal<
    Array<{
      id: number;
      day: string;
      month: string;
      doctorName: string;
      specialty: string;
      doctorPhoto: string;
      time: string;
      location: string;
      status: string;
      statusSeverity: 'info' | 'success' | 'danger' | 'warn';
      isUpcoming: boolean;
      hasReport: boolean;
    }>
  >([]);

  constructor() {
    this.loadPatientTimeline();
  }

  private loadPatientTimeline() {
    this.workflow.getAppointments().subscribe({
      next: (appointments) => {
        const now = new Date();
        this.history.set(
          appointments.map((appointment) => {
            const date = new Date(appointment.appointment_datetime);
            return {
              id: appointment.id,
              day: String(date.getDate()).padStart(2, '0'),
              month: date.toLocaleDateString('es-MX', { month: 'long' }),
              doctorName: appointment.doctor_name,
              specialty: 'Atención Médica',
              doctorPhoto: '/profile/1.webp',
              time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              location: appointment.location,
              status: appointment.status,
              statusSeverity:
                appointment.status === 'Completada'
                  ? 'success'
                  : appointment.status === 'Cancelada'
                    ? 'danger'
                    : 'info',
              isUpcoming: date.getTime() > now.getTime(),
              hasReport: appointment.status === 'Completada',
            };
          }),
        );
      },
      error: () => {
        this.notification.builder().warn().summary('Sin datos').detail('No se pudo cargar el historial de citas.').show();
      },
    });
  }

  onViewReport(itemId: number) {
    this.notification
      .builder()
      .info()
      .summary('Informe clínico')
      .detail(`Mostrando resumen clínico de la cita #${itemId}.`)
      .show();
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { MainContainer } from '@core/layouts/main-container';
import { AppointmentItem } from '@core/models/appointment.model';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SelectModule,
    DialogModule, 
    ButtonModule, 
    RatingModule,
    MainContainer
  ],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppointmentHistory {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  readonly status = signal('');
  readonly appointments = signal<AppointmentItem[]>([]);
  readonly selectedReport = signal<any | null>(null);
  readonly showReportModal = signal(false);
  
  readonly ratingValue = signal(0);
  readonly submittingRating = signal(false);

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
          .detail('No se pudo establecer contacto con el registro central. Reintente en unos instantes.')
          .show();
      },
    });
  }

  openReport(appointmentId: number): void {
    this.appointmentsService.getMyAppointmentReport(appointmentId).subscribe({
      next: (report) => {
        this.selectedReport.set(report);
        this.ratingValue.set(0);
        this.showReportModal.set(true);
      },
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('Informe no disponible')
          .detail('El informe médico aún no ha sido emitido por el profesional.')
          .show();
      },
    });
  }

  closeReport(): void {
    this.showReportModal.set(false);
    this.selectedReport.set(null);
  }

  submitRating(): void {
    const report = this.selectedReport();
    const val = this.ratingValue();
    
    if (!report || val === 0) {
      this.notification.builder().warn().summary('Acción requerida').detail('Por favor seleccione una calificación antes de enviar.').show();
      return;
    }

    this.submittingRating.set(true);
    this.appointmentsService.postAppointmentRating(report.appointment_id, { 
      rating: val,
      doctor_id: report.doctor_id,
      patient_id: report.patient_user_id
    }).subscribe({
      next: () => {
        this.notification.builder().success().summary('Evaluación Registrada').detail('Su calificación fue enviada al servicio de métricas.').show();
        this.closeReport();
        this.submittingRating.set(false);
        this.load();
      },
      error: (err) => {
        this.submittingRating.set(false);
        if (err.status === 409) {
          this.notification.builder().info().summary('Ya Evaluado').detail('Ya registró una calificación para esta consulta.').show();
        } else {
          this.notification.builder().warn().summary('Error de comunicación').detail('No se pudo procesar su evaluación en este momento.').show();
        }
      },
    });
  }
}
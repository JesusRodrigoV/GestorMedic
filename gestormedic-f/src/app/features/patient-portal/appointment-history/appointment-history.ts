import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentItem } from '@core/models/appointment.model';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DialogModule, 
    ButtonModule, 
    RatingModule,
    TagModule
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
  
  // Rating state
  readonly ratingValue = signal(0);
  readonly submittingRating = signal(false);

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

  load(): void {
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

  getSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'CONFIRMED': return 'info';
      case 'PENDING': return 'warn';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  }

  openReport(appointmentId: number): void {
    this.appointmentsService.getMyAppointmentReport(appointmentId).subscribe({
      next: (report) => {
        this.selectedReport.set(report);
        this.ratingValue.set(0);
        this.showReportModal.set(true);
      },
      error: () => {
        this.notification.builder().warn().summary('Informe no disponible').detail('El informe médico aún no ha sido emitido.').show();
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
      this.notification.builder().warn().summary('Acción requerida').detail('Por favor selecciona una calificación').show();
      return;
    }

    this.submittingRating.set(true);
    this.appointmentsService.postAppointmentRating(report.appointment_id, { 
      rating: val,
      doctor_id: report.doctor_id,
      patient_id: report.patient_user_id
    }).subscribe({
      next: () => {
        this.notification.builder().success().summary('¡Gracias!').detail('Tu calificación ha sido enviada correctamente').show();
        this.closeReport();
        this.submittingRating.set(false);
        this.load();
      },
      error: (err) => {
        this.submittingRating.set(false);
        if (err.status === 409) {
          this.notification.builder().info().summary('Ya calificado').detail('Ya habías calificado esta consulta anteriormente').show();
        } else {
          this.notification.builder().warn().summary('Error').detail('No se pudo enviar la calificación').show();
        }
      },
    });
  }
}

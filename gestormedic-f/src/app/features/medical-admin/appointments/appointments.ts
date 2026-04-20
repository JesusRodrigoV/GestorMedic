import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentItem } from '@core/models/appointment.model';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    ButtonModule, 
    TagModule, 
    InputTextModule,
    CardModule,
    DialogModule,
    TextareaModule
  ],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DoctorAppointments {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  readonly day = signal(new Date().toISOString().slice(0, 10));
  readonly rows = signal<AppointmentItem[]>([]);
  readonly loading = signal(false);

  // Report Modal State
  readonly showReportDialog = signal(false);
  readonly submittingReport = signal(false);
  readonly selectedAppointmentId = signal<number | null>(null);
  readonly reportForm = signal({
    diagnosis: '',
    report_text: '',
    prescription: '',
    follow_up: ''
  });

  constructor() {
    this.load();
  }

  onDayChange(value: string): void {
    this.day.set(value);
    this.load();
  }

  load(): void {
    console.log('DoctorAppointments: Loading appointments for day:', this.day());
    this.loading.set(true);
    this.appointmentsService.getDoctorAppointmentsByDay(this.day()).subscribe({
      next: (items) => {
        console.log('DoctorAppointments: Successfully loaded', items.length, 'appointments');
        this.rows.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('DoctorAppointments: Error loading appointments', err);
        this.loading.set(false);
        this.notification
          .builder()
          .warn()
          .summary('Error de carga')
          .detail('No se pudieron recuperar las citas.')
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Completada';
      case 'CONFIRMED': return 'Confirmada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  }

  openReportEditor(appointmentId: number): void {
    this.selectedAppointmentId.set(appointmentId);
    this.reportForm.set({
      diagnosis: '',
      report_text: '',
      prescription: '',
      follow_up: ''
    });
    this.showReportDialog.set(true);
  }

  saveReport(): void {
    const id = this.selectedAppointmentId();
    if (!id) return;

    const form = this.reportForm();
    if (!form.report_text || !form.diagnosis) {
      this.notification.builder().warn().summary('Campos incompletos').detail('Diagnóstico e informe son obligatorios').show();
      return;
    }

    this.submittingReport.set(true);
    this.appointmentsService.postDoctorReport(id, form).subscribe({
      next: () => {
        this.notification.builder().success().summary('Informe guardado').detail('La cita ha sido marcada como completada').show();
        this.showReportDialog.set(false);
        this.submittingReport.set(false);
        this.load();
      },
      error: () => {
        this.submittingReport.set(false);
        this.notification.builder().warn().summary('Error').detail('No se pudo guardar el informe').show();
      },
    });
  }
}

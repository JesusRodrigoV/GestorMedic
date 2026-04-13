import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MedicalWorkflow } from '@core/services/medical-workflow';
import { NotificationService } from '@core/services/notification';
import { ButtonModule } from 'primeng/button';
import { AuthStore } from '@features/auth/stores/auth.store';

type AgendaSlot = {
  id: number;
  time: string;
  patient: string | null;
  patientEmail: string;
  location: string;
  reason: string;
  status: string;
  severity: 'info' | 'success' | 'danger' | 'warn';
  datetime: string;
};

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RoundedButton, TagModule, CardModule, ButtonModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AgendaComponent {
  private workflow = inject(MedicalWorkflow);
  private notification = inject(NotificationService);
  private authStore = inject(AuthStore);
  user = this.authStore.user;

  days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  currentMonth = 'Abril 2026';
  slots = signal<AgendaSlot[]>(
    ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map((time) => ({
      id: 0,
      time,
      patient: null,
      patientEmail: '',
      location: 'Consultorio A-102',
      reason: '',
      status: 'Programada',
      severity: 'info',
      datetime: '',
    })),
  );

  constructor() {
    this.loadAppointments();
  }

  private statusToSeverity(status: string) {
    switch (status) {
      case 'Completada':
        return 'success' as const;
      case 'Cancelada':
        return 'danger' as const;
      case 'Confirmada':
        return 'info' as const;
      default:
        return 'warn' as const;
    }
  }

  private loadAppointments() {
    this.workflow.getAppointments().subscribe({
      next: (appointments) => {
        const today = new Date();
        const daySlots: AgendaSlot[] = this.slots().map((slot) => ({
          ...slot,
          patient: null as string | null,
        }));
        for (const appointment of appointments) {
          const appointmentDate = new Date(appointment.appointment_datetime);
          if (
            appointmentDate.getFullYear() === today.getFullYear() &&
            appointmentDate.getMonth() === today.getMonth() &&
            appointmentDate.getDate() === today.getDate()
          ) {
            const time = appointmentDate.toTimeString().slice(0, 5);
            const idx = daySlots.findIndex((slot) => slot.time === time);
            if (idx >= 0) {
              daySlots[idx] = {
                id: appointment.id,
                time,
                patient: appointment.patient_name,
                patientEmail: appointment.patient_email,
                location: appointment.location,
                reason: appointment.reason,
                status: appointment.status,
                severity: this.statusToSeverity(appointment.status),
                datetime: appointment.appointment_datetime,
              };
            }
          }
        }
        this.slots.set(daySlots);
      },
    });
  }

  onCreateAppointment() {
    if (this.user()?.role_id === 3) {
      this.notification.builder().warn().summary('No permitido').detail('Los pacientes no crean citas desde agenda médica.').show();
      return;
    }
    const patientName = window.prompt('Nombre del paciente');
    if (!patientName) return;
    const patientEmail = window.prompt('Correo del paciente');
    if (!patientEmail) return;
    const hour = window.prompt('Hora (HH:MM)', '09:00');
    if (!hour) return;
    const reason = window.prompt('Motivo de la consulta', 'Consulta general') || 'Consulta general';

    const today = new Date();
    const [h, m] = hour.split(':').map((value) => Number(value));
    today.setHours(h, m, 0, 0);

    this.workflow
      .createAppointment({
        patient_name: patientName,
        patient_email: patientEmail,
        appointment_datetime: today.toISOString(),
        location: 'Consultorio A-102',
        reason,
        status: 'Programada',
      })
      .subscribe({
        next: () => {
          this.notification.builder().success().summary('Cita creada').detail('La cita fue registrada.').show();
          this.loadAppointments();
        },
        error: () => {
          this.notification.builder().error().summary('Error').detail('No se pudo crear la cita.').show();
        },
      });
  }

  onPublishAvailability() {
    if (this.user()?.role_id === 3) {
      this.notification.builder().warn().summary('No permitido').detail('Solo doctores pueden publicar horarios.').show();
      return;
    }
    const date = window.prompt('Fecha disponible (YYYY-MM-DD)');
    if (!date) return;
    const hoursInput = window.prompt('Horas disponibles separadas por coma (ej: 09:00,10:00,11:30)');
    if (!hoursInput) return;
    const hours = hoursInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    if (hours.length === 0) {
      return;
    }

    this.workflow
      .createDoctorAvailability({
        date,
        hours,
        slot_duration_minutes: 30,
      })
      .subscribe({
        next: (created) => {
          this.notification
            .builder()
            .success()
            .summary('Horarios publicados')
            .detail(`Se publicaron ${created.length} horarios disponibles.`)
            .show();
        },
        error: () => {
          this.notification.builder().error().summary('Error').detail('No se pudieron publicar horarios.').show();
        },
      });
  }

  onUpdateAppointmentStatus(slotId: number, status: 'Confirmada' | 'Completada') {
    if (!slotId) return;
    this.workflow.updateAppointmentStatus(slotId, status).subscribe({
      next: () => {
        this.notification
          .builder()
          .success()
          .summary('Cita actualizada')
          .detail(`Estado actualizado a ${status}.`)
          .show();
        this.loadAppointments();
      },
      error: () => {
        this.notification.builder().error().summary('Error').detail('No se pudo actualizar la cita.').show();
      },
    });
  }
}

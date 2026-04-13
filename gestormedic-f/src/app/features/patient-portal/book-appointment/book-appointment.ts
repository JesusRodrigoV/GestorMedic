import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalWorkflow } from '@core/services/medical-workflow';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RoundedButton],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BookAppointment {
  private workflow = inject(MedicalWorkflow);
  private notification = inject(NotificationService);

  doctors = signal<Array<{ id: number; name: string; specialty: string }>>([]);
  selectedDoctorId = signal<number | null>(null);
  selectedDate = signal<string>(new Date().toISOString().slice(0, 10));
  reason = signal<string>('Consulta general');
  availableSlots = signal<
    Array<{ id: number; label: string; startIso: string; doctorName: string }>
  >([]);

  constructor() {
    this.loadDoctors();
  }

  private loadDoctors() {
    this.workflow.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        if (doctors.length) {
          this.selectedDoctorId.set(doctors[0].id);
        }
      },
    });
  }

  onDoctorChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.selectedDoctorId.set(Number.isNaN(value) ? null : value);
    this.availableSlots.set([]);
  }

  onDateChange(event: Event) {
    this.selectedDate.set((event.target as HTMLInputElement).value);
    this.availableSlots.set([]);
  }

  onReasonChange(event: Event) {
    this.reason.set((event.target as HTMLInputElement).value);
  }

  loadAvailability() {
    const doctorId = this.selectedDoctorId();
    const date = this.selectedDate();
    if (!doctorId || !date) {
      this.notification
        .builder()
        .warn()
        .summary('Datos incompletos')
        .detail('Selecciona doctor y fecha para consultar horarios.')
        .show();
      return;
    }

    this.workflow.getDoctorAvailability(doctorId, date).subscribe({
      next: (slots) => {
        this.availableSlots.set(
          slots.map((slot) => ({
            id: slot.id,
            label: new Date(slot.slot_start).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            startIso: slot.slot_start,
            doctorName: slot.doctor_name,
          })),
        );
      },
      error: () => {
        this.notification
          .builder()
          .error()
          .summary('Error')
          .detail('No se pudo consultar la disponibilidad.')
          .show();
      },
    });
  }

  reserve(slotId: number, label: string) {
    this.workflow
      .bookAppointment({
        slot_id: slotId,
        reason: this.reason(),
      })
      .subscribe({
        next: () => {
          this.notification
            .builder()
            .success()
            .summary('Cita reservada')
            .detail(`Reservaste el horario de las ${label}.`)
            .show();
          this.loadAvailability();
        },
        error: () => {
          this.notification
            .builder()
            .error()
            .summary('Error')
            .detail('No se pudo reservar el horario seleccionado.')
            .show();
        },
      });
  }
}

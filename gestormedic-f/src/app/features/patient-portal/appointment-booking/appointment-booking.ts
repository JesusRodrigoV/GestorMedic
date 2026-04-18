import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoctorCard, SlotItem, SlotsByDay } from '@core/models/appointment.model';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';

@Component({
  selector: 'app-appointment-booking',
  imports: [FormsModule],
  templateUrl: './appointment-booking.html',
  styleUrl: './appointment-booking.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppointmentBooking {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  doctors = signal<DoctorCard[]>([]);
  selectedDoctor = signal<DoctorCard | null>(null);
  slotsByDay = signal<SlotsByDay[]>([]);
  query = signal('');
  mode = signal<'cards' | 'calendar'>('cards');
  sidebarOpen = signal(false);
  rightPaneWidth = signal(36);
  selectedSlot = signal<SlotItem | null>(null);
  isReserveModalOpen = signal(false);
  reserveNotes = signal('');

  readonly filteredDoctors = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.doctors();
    return this.doctors().filter((doctor) => {
      return (
        doctor.doctor_name.toLowerCase().includes(q) ||
        doctor.email.toLowerCase().includes(q) ||
        doctor.specialties.some((item) => item.toLowerCase().includes(q))
      );
    });
  });

  readonly availableSlots = computed(() =>
    this.slotsByDay().flatMap((bucket) => bucket.slots.filter((slot) => slot.is_available)),
  );

  constructor() {
    this.loadDoctors();

    effect(() => {
      const doctor = this.selectedDoctor();
      if (!doctor) return;

      const now = new Date();
      const from = now.toISOString().slice(0, 10);
      const toDate = new Date(now);
      toDate.setDate(toDate.getDate() + 14);
      const to = toDate.toISOString().slice(0, 10);

      this.appointmentsService.getDoctorAvailability(doctor.doctor_id, from, to).subscribe({
        next: (items) => this.slotsByDay.set(items),
        error: () => {
          this.slotsByDay.set([]);
          this.notification
            .builder()
            .warn()
            .summary('No se pudo cargar la agenda')
            .detail('Intente nuevamente en unos segundos.')
            .show();
        },
      });
    });
  }

  loadDoctors(): void {
    this.appointmentsService.listDoctors({ page: 1, page_size: 30 }).subscribe({
      next: (response) => this.doctors.set(response.items),
      error: () => {
        this.notification
          .builder()
          .error()
          .summary('Error al cargar doctores')
          .detail('No se obtuvo la lista de profesionales.')
          .show();
      },
    });
  }

  onSearchChange(value: string): void {
    this.query.set(value);
  }

  openDoctor(doctor: DoctorCard): void {
    this.selectedDoctor.set(doctor);
    this.sidebarOpen.set(true);
  }

  closeDetail(): void {
    this.sidebarOpen.set(false);
    this.selectedDoctor.set(null);
    this.slotsByDay.set([]);
  }

  onStartResize(event: MouseEvent): void {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = this.rightPaneWidth();

    const onMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const viewportWidth = window.innerWidth;
      const deltaPercent = (delta / viewportWidth) * 100;
      const nextWidth = Math.min(52, Math.max(28, startWidth + deltaPercent));
      this.rightPaneWidth.set(nextWidth);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  formatSlot(slot: SlotItem): string {
    const start = new Date(slot.starts_at);
    const end = new Date(slot.ends_at);
    return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  openReserveModal(slot: SlotItem): void {
    this.selectedSlot.set(slot);
    this.reserveNotes.set('');
    this.isReserveModalOpen.set(true);
  }

  closeReserveModal(): void {
    this.isReserveModalOpen.set(false);
    this.selectedSlot.set(null);
  }

  confirmReservation(): void {
    const doctor = this.selectedDoctor();
    const slot = this.selectedSlot();
    if (!doctor || !slot) {
      return;
    }

    this.appointmentsService
      .reserveAppointment({
        doctor_id: doctor.doctor_id,
        starts_at: slot.starts_at,
        extra_notes: this.reserveNotes().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.notification
            .builder()
            .success()
            .summary('Cita reservada')
            .detail('Tu cita fue confirmada correctamente.')
            .show();

          this.closeReserveModal();
          const refreshed = this.slotsByDay().map((bucket) => ({
            ...bucket,
            slots: bucket.slots.map((item) =>
              item.starts_at === slot.starts_at ? { ...item, is_available: false } : item,
            ),
          }));
          this.slotsByDay.set(refreshed);
        },
        error: (err) => {
          const message = err?.error?.detail || 'No se pudo reservar el horario seleccionado.';
          this.notification.builder().error().summary('Reserva no realizada').detail(message).show();
        },
      });
  }
}

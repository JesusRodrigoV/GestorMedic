import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlotItem, SlotsByDay } from '@core/models/appointment.model';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';
import { map } from 'rxjs';

@Component({
  selector: 'app-agenda-calendar',
  imports: [FormsModule],
  templateUrl: './agenda-calendar.html',
  styleUrl: './agenda-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AgendaCalendar {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  view = signal<'dia' | 'semana' | 'mes'>('semana');
  slotsByDay = signal<SlotsByDay[]>([]);
  selectedSlot = signal<SlotItem | null>(null);
  modalOpen = signal(false);

  editEnd = signal('');
  editRoomId = signal(0);
  editSpecialtyId = signal(0);
  editPrice = signal(0);
  editDescription = signal('');
  editBlocked = signal(false);

  specialties = signal<{ id: number; name: string }[]>([]);
  rooms = signal<{ id: number; name: string; is_active: boolean }[]>([]);

  readonly flattened = computed(() => this.slotsByDay().flatMap((bucket) => bucket.slots));

  constructor() {
    this.load();
    this.appointmentsService
      .listPublicSpecialties()
      .pipe(map((res: any) => res.items || res))
      .subscribe({ next: (rows) => this.specialties.set(rows) });
      
    this.appointmentsService
      .listClinicRooms()
      .pipe(map((res: any) => res.items || res))
      .subscribe({
        next: (rows) => this.rooms.set(rows.filter((item: any) => item.is_active)),
      });
  }

  load(): void {
    const now = new Date();
    const from = now.toISOString().slice(0, 10);
    const to = new Date(now);
    to.setDate(to.getDate() + (this.view() === 'dia' ? 1 : this.view() === 'semana' ? 7 : 31));

    this.appointmentsService.getDoctorCalendar(from, to.toISOString().slice(0, 10)).subscribe({
      next: (rows) => this.slotsByDay.set(rows),
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('No se pudo cargar calendario')
          .detail('Verifica tu agenda semanal y permisos de consultorio.')
          .show();
      },
    });
  }

  setView(view: 'dia' | 'semana' | 'mes'): void {
    this.view.set(view);
    this.load();
  }

  openSlot(slot: SlotItem): void {
    this.selectedSlot.set(slot);
    this.editEnd.set(slot.ends_at.slice(0, 16));
    this.editRoomId.set(slot.room_id);
    this.editSpecialtyId.set(slot.specialty_id);
    this.editPrice.set(slot.consultation_price || 0);
    this.editDescription.set('');
    this.editBlocked.set(!slot.is_available);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.selectedSlot.set(null);
  }

  saveSlot(): void {
    const slot = this.selectedSlot();
    if (!slot) return;

    this.appointmentsService
      .patchDoctorSlot(slot.starts_at, {
        slot_end: new Date(this.editEnd()).toISOString(),
        room_id: this.editRoomId(),
        specialty_id: this.editSpecialtyId(),
        consultation_price: this.editPrice(),
        extra_description: this.editDescription().trim() || undefined,
        is_blocked: this.editBlocked(),
      })
      .subscribe({
        next: () => {
          this.notification.builder().success().summary('Horario actualizado').show();
          this.closeModal();
          this.load();
        },
        error: (err) => {
          const message = err?.error?.detail || 'No se pudieron guardar los cambios de este horario.';
          this.notification.builder().error().summary('Actualizacion fallida').detail(message).show();
        },
      });
  }

  colorBySpecialty(name: string): string {
    const palette = ['#E8F0FE', '#E6F7ED', '#FEF4E8', '#F3E8FF', '#E8F7FA'];
    const index = Math.abs(name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % palette.length;
    return palette[index];
  }

  formatSlot(slot: SlotItem): string {
    const startsAt = new Date(slot.starts_at);
    const endsAt = new Date(slot.ends_at);
    return `${startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

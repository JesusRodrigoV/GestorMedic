import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeeklyBlock } from '@core/models/appointment.model';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';
import { map } from 'rxjs';

const WEEK_DAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

@Component({
  selector: 'app-weekly-agenda',
  imports: [FormsModule],
  templateUrl: './weekly-agenda.html',
  styleUrl: './weekly-agenda.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WeeklyAgenda {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  readonly weekDays = WEEK_DAYS;
  readonly selectedDay = signal(0);
  readonly blocks = signal<WeeklyBlock[]>([]);
  readonly specialties = signal<{ id: number; name: string }[]>([]);
  readonly rooms = signal<{ id: number; name: string; is_active: boolean }[]>([]);
  readonly dirty = signal(false);

  constructor() {
    this.loadInitial();
  }

  hasPendingChanges(): boolean {
    return this.dirty();
  }

  selectDay(day: number): void {
    this.selectedDay.set(day);
  }

  dayBlocks(day: number): WeeklyBlock[] {
    return this.blocks().filter((item) => item.weekday === day);
  }

  addBlock(): void {
    const day = this.selectedDay();
    this.blocks.update((items) => [
      ...items,
      {
        weekday: day,
        start_time: '08:00',
        end_time: '09:00',
        consultation_minutes: 30,
        specialty_id: this.specialties()[0]?.id || 1,
        room_id: this.rooms()[0]?.id || 1,
        consultation_price: 0,
      },
    ]);
    this.dirty.set(true);
  }

  updateBlock(index: number, field: keyof WeeklyBlock, value: string | number): void {
    this.blocks.update((items) => {
      const clone = [...items];
      const dayItems = clone
        .map((item, idx) => ({ item, idx }))
        .filter((item) => item.item.weekday === this.selectedDay());
      const target = dayItems[index];
      if (!target) return clone;
      clone[target.idx] = { ...clone[target.idx], [field]: value };
      return clone;
    });
    this.dirty.set(true);
  }

  removeBlock(index: number): void {
    this.blocks.update((items) => {
      const clone = [...items];
      const dayItems = clone
        .map((item, idx) => ({ item, idx }))
        .filter((item) => item.item.weekday === this.selectedDay());
      const target = dayItems[index];
      if (!target) return clone;
      clone.splice(target.idx, 1);
      return clone;
    });
    this.dirty.set(true);
  }

  save(): void {
    this.appointmentsService.saveWeeklyAgenda(this.blocks()).subscribe({
      next: (rows) => {
        this.blocks.set(rows);
        this.dirty.set(false);
        this.notification
          .builder()
          .success()
          .summary('Agenda semanal guardada')
          .detail('Los bloques de atencion se registraron correctamente.')
          .show();
      },
      error: (err) => {
        const message = err?.error?.detail || 'Verifica solapamientos y permisos de consultorio.';
        this.notification
          .builder()
          .error()
          .summary('No se pudo guardar la agenda')
          .detail(message)
          .show();
      },
    });
  }

  private loadInitial(): void {
    this.appointmentsService.getWeeklyAgenda().subscribe({
      next: (rows) => this.blocks.set(rows),
    });

    this.appointmentsService
      .listPublicSpecialties()
      .pipe(map((res: any) => res.items || res))
      .subscribe({
        next: (rows) => this.specialties.set(rows),
      });

    this.appointmentsService
      .listClinicRooms()
      .pipe(map((res: any) => res.items || res))
      .subscribe({
        next: (rows) => this.rooms.set(rows.filter((item: any) => item.is_active)),
      });
  }
}

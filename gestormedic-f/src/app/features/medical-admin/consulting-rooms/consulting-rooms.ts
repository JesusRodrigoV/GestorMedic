import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentsService } from '@core/services/appointments';
import { NotificationService } from '@core/services/notification';

const WEEK_DAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

@Component({
  selector: 'app-consulting-rooms',
  imports: [FormsModule],
  templateUrl: './consulting-rooms.html',
  styleUrl: './consulting-rooms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConsultingRooms {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  readonly weekDays = WEEK_DAYS;

  rooms = signal<{ id: number; name: string; is_active: boolean }[]>([]);
  doctors = signal<{ doctor_id: number; name: string; email: string }[]>([]);
  specialties = signal<{ id: number; name: string }[]>([]);
  selectedRoomId = signal<number | null>(null);

  selectedDoctorId = signal(0);
  selectedWeekday = signal(0);
  startTime = signal('08:00');
  endTime = signal('12:00');
  selectedSpecialtyId = signal(0);

  roomDoctorPermissions = signal<
    Array<{ id: number; doctor_id: number; weekday: number; start_time: string; end_time: string; is_active: boolean }>
  >([]);
  roomSpecialtyPermissions = signal<Array<{ id: number; specialty_id: number; is_active: boolean }>>([]);

  selectedRoomName = computed(() =>
    this.rooms().find((room) => room.id === this.selectedRoomId())?.name || 'Sin consultorio seleccionado',
  );

  doctorName(doctorId: number): string {
    return this.doctors().find((doctor) => doctor.doctor_id === doctorId)?.name || `Doctor ${doctorId}`;
  }

  specialtyName(specialtyId: number): string {
    return this.specialties().find((item) => item.id === specialtyId)?.name || `Especialidad ${specialtyId}`;
  }

  constructor() {
    this.loadBase();
  }

  onRoomSelect(roomId: number): void {
    this.selectedRoomId.set(roomId);
    this.loadRoomPermissions();
  }

  addDoctorPermission(): void {
    const roomId = this.selectedRoomId();
    if (!roomId) {
      this.notification.builder().warn().summary('Selecciona un consultorio').show();
      return;
    }

    this.appointmentsService
      .addDoctorRoomPermission(roomId, {
        doctor_id: this.selectedDoctorId(),
        weekday: this.selectedWeekday(),
        start_time: this.startTime(),
        end_time: this.endTime(),
      })
      .subscribe({
        next: () => {
          this.notification.builder().success().summary('Permiso doctor agregado').show();
          this.loadRoomPermissions();
        },
        error: (err) => {
          const message = err?.error?.detail || 'No se pudo agregar el permiso del doctor.';
          this.notification.builder().error().summary('Operacion fallida').detail(message).show();
        },
      });
  }

  addSpecialtyPermission(): void {
    const roomId = this.selectedRoomId();
    if (!roomId) {
      this.notification.builder().warn().summary('Selecciona un consultorio').show();
      return;
    }

    this.appointmentsService
      .addSpecialtyRoomPermission(roomId, {
        specialty_id: this.selectedSpecialtyId(),
      })
      .subscribe({
        next: () => {
          this.notification.builder().success().summary('Especialidad habilitada').show();
          this.loadRoomPermissions();
        },
        error: (err) => {
          const message = err?.error?.detail || 'No se pudo agregar la especialidad.';
          this.notification.builder().error().summary('Operacion fallida').detail(message).show();
        },
      });
  }

  private loadBase(): void {
    this.appointmentsService.listClinicRooms().subscribe({
      next: (rows) => {
        const activeRooms = rows.filter((item) => item.is_active);
        this.rooms.set(activeRooms);
        if (activeRooms.length && !this.selectedRoomId()) {
          this.selectedRoomId.set(activeRooms[0].id);
          this.loadRoomPermissions();
        }
      },
    });

    this.appointmentsService.listClinicDoctors().subscribe({
      next: (rows) => {
        this.doctors.set(rows);
        if (rows.length) {
          this.selectedDoctorId.set(rows[0].doctor_id);
        }
      },
    });

    this.appointmentsService.listAdminSpecialties().subscribe({
      next: (rows) => {
        this.specialties.set(rows);
        if (rows.length) {
          this.selectedSpecialtyId.set(rows[0].id);
        }
      },
    });
  }

  private loadRoomPermissions(): void {
    const roomId = this.selectedRoomId();
    if (!roomId) return;

    this.appointmentsService.getRoomPermissions(roomId).subscribe({
      next: (payload) => {
        this.roomDoctorPermissions.set(payload.doctor_permissions);
        this.roomSpecialtyPermissions.set(payload.specialty_permissions);
      },
      error: () => {
        this.roomDoctorPermissions.set([]);
        this.roomSpecialtyPermissions.set([]);
      },
    });
  }
}

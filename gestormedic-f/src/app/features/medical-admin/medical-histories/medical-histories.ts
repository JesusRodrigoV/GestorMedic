import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { AppointmentsService } from '@core/services/appointments';
import { MedicalHistoryEntry, PatientMedicalFile } from '@core/models/medical-records.model';
import { MedicalRecordsService } from '@core/services/medical-records';
import { NotificationService } from '@core/services/notification';
import { forkJoin } from 'rxjs';

interface AppointmentOption {
  label: string;
  value: string;
  patientUserId: string;
  specialtyName: string;
}

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-medical-histories-admin',
  imports: [FormsModule, SelectModule],
  templateUrl: './medical-histories.html',
  styleUrl: './medical-histories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MedicalHistoriesAdmin {
  private recordsService = inject(MedicalRecordsService);
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  readonly editableEntries = signal<MedicalHistoryEntry[]>([]);
  readonly selectedPatientFilesUserId = signal('');
  readonly patientFiles = signal<PatientMedicalFile[]>([]);

  readonly selectedDay = signal(new Date().toISOString().slice(0, 10));
  readonly appointmentOptions = signal<AppointmentOption[]>([]);
  readonly patientOptions = signal<SelectOption[]>([]);
  readonly specialtyOptions = signal<SelectOption[]>([]);
  readonly specialtyByName = signal<Record<string, string>>({});

  readonly appointmentId = signal('');
  readonly patientUserId = signal('');
  readonly specialtyId = signal('');
  readonly specialtyName = signal('');
  readonly sectionTitle = signal('');
  readonly notes = signal('');
  readonly selectedEntryId = signal<string | null>(null);

  constructor() {
    this.loadEditableEntries();
    this.loadSelectionData();
  }

  loadSelectionData(): void {
    const day = this.selectedDay();
    forkJoin({
      appointments: this.appointmentsService.getDoctorAppointmentsByDay(day),
      specialties: this.appointmentsService.listSpecialties(),
    }).subscribe({
      next: ({ appointments, specialties }) => {
        const specialtyMap = specialties.reduce<Record<string, string>>((acc, specialty) => {
          acc[specialty.name.trim().toLowerCase()] = String(specialty.id);
          return acc;
        }, {});

        this.specialtyByName.set(specialtyMap);
        this.specialtyOptions.set(
          specialties.map((specialty) => ({
            label: specialty.name,
            value: String(specialty.id),
          })),
        );

        this.appointmentOptions.set(
          appointments.map((appointment) => ({
            label: `#${appointment.id} · ${appointment.patient_name} · ${appointment.specialty_name} · ${new Date(appointment.starts_at).toLocaleString()}`,
            value: String(appointment.id),
            patientUserId: String(appointment.patient_user_id),
            specialtyName: appointment.specialty_name,
          })),
        );

        const patientMap = new Map<string, string>();
        for (const appointment of appointments) {
          const key = String(appointment.patient_user_id);
          if (!patientMap.has(key)) {
            patientMap.set(key, `${appointment.patient_name} (#${key})`);
          }
        }
        this.patientOptions.set(
          Array.from(patientMap.entries()).map(([value, label]) => ({ value, label })),
        );
      },
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('No se pudieron cargar citas/especialidades')
          .detail('Verifica que tengas citas registradas para la fecha seleccionada.')
          .show();
      },
    });
  }

  onAppointmentSelected(appointmentValue: string): void {
    this.appointmentId.set(appointmentValue || '');
    const selected = this.appointmentOptions().find((option) => option.value === appointmentValue);
    if (!selected) {
      return;
    }

    this.patientUserId.set(selected.patientUserId);
    this.selectedPatientFilesUserId.set(selected.patientUserId);
    this.specialtyName.set(selected.specialtyName);

    const mappedSpecialty = this.specialtyByName()[selected.specialtyName.trim().toLowerCase()];
    this.specialtyId.set(mappedSpecialty || '');
  }

  onSpecialtySelected(specialtyValue: string): void {
    this.specialtyId.set(specialtyValue || '');
    const selected = this.specialtyOptions().find((option) => option.value === specialtyValue);
    this.specialtyName.set(selected?.label ?? '');
  }

  onCreateEntry(): void {
    const payload = {
      appointment_id: Number(this.appointmentId()),
      patient_user_id: Number(this.patientUserId()),
      specialty_id: Number(this.specialtyId()),
      specialty_name: this.specialtyName().trim(),
      section_title: this.sectionTitle().trim(),
      notes: this.notes().trim() || undefined,
      checklist: [],
      structured_fields: {},
    };

    if (!payload.appointment_id || !payload.patient_user_id || !payload.specialty_id || !payload.specialty_name || !payload.section_title) {
      this.notification.builder().warn().summary('Completa los campos obligatorios').show();
      return;
    }

    this.recordsService.createDoctorEntry(payload).subscribe({
      next: () => {
        this.notification
          .builder()
          .success()
          .summary('Entrada agregada al historial')
          .detail('Se registró una nueva consulta sin sobrescribir lo anterior.')
          .show();
        this.clearForm();
        this.loadEditableEntries();
      },
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('No se pudo registrar la entrada')
          .detail('Verifica datos de cita/paciente/especialidad.')
          .show();
      },
    });
  }

  startEdit(entry: MedicalHistoryEntry): void {
    this.selectedEntryId.set(entry.id);
    this.sectionTitle.set(entry.section_title);
    this.notes.set(entry.notes || '');
  }

  onPatchSelected(): void {
    const entryId = this.selectedEntryId();
    if (!entryId) {
      return;
    }

    this.recordsService
      .patchDoctorEntry(entryId, {
        section_title: this.sectionTitle().trim() || undefined,
        notes: this.notes().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.notification.builder().success().summary('Entrada actualizada').show();
          this.selectedEntryId.set(null);
          this.clearForm();
          this.loadEditableEntries();
        },
        error: () => {
          this.notification
            .builder()
            .warn()
            .summary('No se pudo editar')
            .detail('Solo puedes editar entradas propias dentro de 3 días.')
            .show();
        },
      });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  loadPatientFiles(): void {
    const patientUserId = Number(this.selectedPatientFilesUserId());
    if (!patientUserId) {
      this.notification.builder().warn().summary('Ingresa un ID de paciente válido').show();
      return;
    }

    this.recordsService.listDoctorPatientFiles(patientUserId).subscribe({
      next: (rows) => this.patientFiles.set(rows),
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('No se pudo cargar archivos del paciente')
          .detail('Verifica que tengas al menos una cita vinculada con el paciente.')
          .show();
      },
    });
  }

  openPatientFile(file: PatientMedicalFile): void {
    const patientUserId = Number(this.selectedPatientFilesUserId());
    if (!patientUserId) {
      return;
    }
    const url = this.recordsService.getDoctorPatientFileContentUrl(patientUserId, file.id);
    window.open(url, '_blank', 'noopener');
  }

  private loadEditableEntries(): void {
    this.recordsService.listEditableDoctorEntries().subscribe({
      next: (rows) => this.editableEntries.set(rows),
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('No se pudieron cargar entradas editables')
          .detail('Intenta de nuevo en unos segundos.')
          .show();
      },
    });
  }

  private clearForm(): void {
    this.appointmentId.set('');
    this.patientUserId.set('');
    this.specialtyId.set('');
    this.specialtyName.set('');
    this.sectionTitle.set('');
    this.notes.set('');
  }
}

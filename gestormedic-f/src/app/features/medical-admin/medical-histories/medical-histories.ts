import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicalHistoryEntry, PatientMedicalFile } from '@core/models/medical-records.model';
import { MedicalRecordsService } from '@core/services/medical-records';
import { NotificationService } from '@core/services/notification';

@Component({
  selector: 'app-medical-histories-admin',
  imports: [FormsModule],
  templateUrl: './medical-histories.html',
  styleUrl: './medical-histories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MedicalHistoriesAdmin {
  private recordsService = inject(MedicalRecordsService);
  private notification = inject(NotificationService);

  readonly editableEntries = signal<MedicalHistoryEntry[]>([]);
  readonly selectedPatientFilesUserId = signal('');
  readonly patientFiles = signal<PatientMedicalFile[]>([]);

  readonly appointmentId = signal('');
  readonly patientUserId = signal('');
  readonly specialtyId = signal('');
  readonly specialtyName = signal('');
  readonly sectionTitle = signal('');
  readonly notes = signal('');
  readonly selectedEntryId = signal<string | null>(null);

  constructor() {
    this.loadEditableEntries();
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

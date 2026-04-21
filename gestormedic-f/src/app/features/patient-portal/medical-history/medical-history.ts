import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainContainer } from '@core/layouts/main-container';
import {
  MedicalHistory as MedicalHistoryModel,
  MedicalHistoryEntry,
} from '@core/models/medical-records.model';
import { MedicalRecordsService } from '@core/services/medical-records';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-medical-history',
  imports: [FormsModule, InputTextModule, TextareaModule, MainContainer, RoundedButton],
  templateUrl: './medical-history.html',
  styleUrl: './medical-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MedicalHistory {
  private recordsService = inject(MedicalRecordsService);
  private notification = inject(NotificationService);

  readonly histories = signal<MedicalHistoryModel[]>([]);
  readonly selectedHistoryId = signal<string | null>(null);
  readonly entries = signal<MedicalHistoryEntry[]>([]);
  readonly isSaving = signal(false);

  readonly bloodType = signal<string>('');
  readonly allergiesText = signal<string>('');
  readonly conditionsText = signal<string>('');
  readonly medicationsText = signal<string>('');
  readonly emergencyName = signal<string>('');
  readonly emergencyPhone = signal<string>('');
  readonly notes = signal<string>('');

  constructor() {
    this.loadHistories();
  }

  onSelectHistory(historyId: string): void {
    this.selectedHistoryId.set(historyId);
    this.loadDetail(historyId);
  }

  onSaveBasicFields(): void {
    const historyId = this.selectedHistoryId();
    if (!historyId) {
      return;
    }

    this.isSaving.set(true);
    this.recordsService
      .patchBasicFields(historyId, {
        blood_type: this.bloodType().trim() || null,
        allergies: this.parseList(this.allergiesText()),
        chronic_conditions: this.parseList(this.conditionsText()),
        current_medications: this.parseList(this.medicationsText()),
        emergency_contact_name: this.emergencyName().trim() || null,
        emergency_contact_phone: this.emergencyPhone().trim() || null,
        notes: this.notes().trim() || null,
      })
      .subscribe({
        next: (updated) => {
          this.isSaving.set(false);
          this.applyBasicFields(updated.basic_fields);
          this.notification
            .builder()
            .success()
            .summary('Expediente actualizado')
            .detail('Los parámetros fisiológicos han sido registrados correctamente.')
            .show();
        },
        error: () => {
          this.isSaving.set(false);
          this.notification
            .builder()
            .error()
            .summary('Fallo de escritura')
            .detail('El sistema no pudo confirmar los cambios en la base de datos.')
            .show();
        },
      });
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  private loadHistories(): void {
    this.recordsService.listMyHistories().subscribe({
      next: (rows) => {
        this.histories.set(rows);
        const first = rows[0]?.id;
        if (first) {
          this.selectedHistoryId.set(first);
          this.loadDetail(first);
        }
      },
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('Error de lectura')
          .detail('No se pudo acceder a los expedientes. Verifique su conexión.')
          .show();
      },
    });
  }

  private loadDetail(historyId: string): void {
    this.recordsService.getMyHistory(historyId).subscribe({
      next: (result) => {
        this.entries.set(result.entries);
        this.applyBasicFields(result.history.basic_fields || {});
      },
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('Fallo de lectura')
          .detail('No se pudo recuperar el detalle de la especialidad seleccionada.')
          .show();
      },
    });
  }

  private applyBasicFields(fields: MedicalHistoryModel['basic_fields']): void {
    this.bloodType.set((fields.blood_type as string) || '');
    this.allergiesText.set(((fields.allergies as string[]) || []).join(', '));
    this.conditionsText.set(((fields.chronic_conditions as string[]) || []).join(', '));
    this.medicationsText.set(((fields.current_medications as string[]) || []).join(', '));
    this.emergencyName.set((fields.emergency_contact_name as string) || '');
    this.emergencyPhone.set((fields.emergency_contact_phone as string) || '');
    this.notes.set((fields.notes as string) || '');
  }

  private parseList(input: string): string[] {
    return input
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalWorkflow } from '@core/services/medical-workflow';

@Component({
  selector: 'app-patient-medical-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medical-history.html',
  styleUrl: './medical-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PatientMedicalHistory {
  private workflow = inject(MedicalWorkflow);

  records = signal<Array<{ id: number; patient_name: string; diagnosis: string; notes: string; created_at: string }>>(
    [],
  );
  prescriptions = signal<
    Array<{ id: number; medication: string; indications: string; issued_at: string; status: string }>
  >([]);

  constructor() {
    this.workflow.getMedicalRecords().subscribe((records) => this.records.set(records));
    this.workflow.getPrescriptions().subscribe((prescriptions) =>
      this.prescriptions.set(
        prescriptions.map((prescription) => ({
          id: prescription.id,
          medication: prescription.medication,
          indications: prescription.indications,
          issued_at: prescription.issued_at,
          status: prescription.status,
        })),
      ),
    );
  }
}

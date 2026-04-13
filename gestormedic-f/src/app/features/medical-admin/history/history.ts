import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { AvatarModule } from 'primeng/avatar';
import { MedicalWorkflow } from '@core/services/medical-workflow';
import { NotificationService } from '@core/services/notification';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    RoundedButton,
    AvatarModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HistoryComponent {
  private workflow = inject(MedicalWorkflow);
  private notification = inject(NotificationService);

  records = signal<
    Array<{
      id: number;
      date: string;
      patient: string;
      patientEmail: string;
      diagnosis: string;
      treatment: string;
      status: string;
      statusSeverity: 'success' | 'info';
    }>
  >([]);

  constructor() {
    this.loadRecords();
  }

  loadRecords() {
    this.workflow.getMedicalRecords().subscribe({
      next: (records) => {
        this.records.set(
          records.map((record) => ({
            id: record.id,
            date: new Date(record.created_at).toLocaleDateString('es-MX'),
            patient: record.patient_name,
            patientEmail: record.patient_email,
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            status: record.status,
            statusSeverity: record.status === 'Finalizado' ? 'success' : 'info',
          })),
        );
      },
    });
  }

  onCreateRecord() {
    const patientName = window.prompt('Paciente');
    if (!patientName) return;
    const patientEmail = window.prompt('Correo del paciente');
    if (!patientEmail) return;
    const diagnosis = window.prompt('Diagnóstico');
    if (!diagnosis) return;
    const treatment = window.prompt('Tratamiento');
    if (!treatment) return;
    const notes = window.prompt('Notas clínicas', '') || '';

    this.workflow
      .createMedicalRecord({
        patient_name: patientName,
        patient_email: patientEmail,
        diagnosis,
        treatment,
        notes,
        status: 'Seguimiento',
      })
      .subscribe({
        next: () => {
          this.notification.builder().success().summary('Registro creado').detail('Historial clínico actualizado.').show();
          this.loadRecords();
        },
        error: () => {
          this.notification.builder().error().summary('Error').detail('No se pudo crear el registro.').show();
        },
      });
  }

  onGeneratePrescription(recordId: number, patientName: string, patientEmail: string) {
    const medication = window.prompt(`Medicamento para ${patientName}`);
    if (!medication) return;
    const indications = window.prompt('Indicaciones', 'Tomar una tableta cada 8 horas') || '';

    this.workflow
      .createPrescription({
        patient_name: patientName,
        patient_email: patientEmail,
        medication,
        indications,
        medical_record_id: recordId,
        status: 'Activa',
      })
      .subscribe({
        next: () => {
          this.notification.builder().success().summary('Receta generada').detail('La receta fue emitida correctamente.').show();
        },
        error: () => {
          this.notification.builder().error().summary('Error').detail('No se pudo generar la receta.').show();
        },
      });
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { MedicalRecordsService } from '@core/services/medical-records';
import { NotificationService } from '@core/services/notification';
import { PatientMedicalFile } from '@core/models/medical-records.model';
import { DicomAdvancedViewer } from '@shared/components/file-viewers/dicom-advanced-viewer/dicom-advanced-viewer';
import { DocxViewer } from '@shared/components/file-viewers/docx-viewer/docx-viewer';
import { GenericViewer } from '@shared/components/file-viewers/generic-viewer/generic-viewer';
import { ImageViewer } from '@shared/components/file-viewers/image-viewer/image-viewer';
import { PdfViewer } from '@shared/components/file-viewers/pdf-viewer/pdf-viewer';
import { MainContainer } from '@core/layouts/main-container';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RoundedButton } from '@shared/ui/rounded-button';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-document-center',
  imports: [
    DatePipe,
    DecimalPipe,
    UpperCasePipe,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    MainContainer,
    RoundedButton,
    DicomAdvancedViewer,
    DocxViewer,
    GenericViewer,
    ImageViewer,
    PdfViewer,
  ],
  templateUrl: './document-center.html',
  styleUrl: './document-center.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class DocumentCenter {
  private recordsService = inject(MedicalRecordsService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  readonly activeTab = signal<'upload' | 'viewer'>('upload');
  readonly selectedFiles = signal<File[]>([]);
  readonly files = signal<PatientMedicalFile[]>([]);
  readonly selectedView = signal<PatientMedicalFile | null>(null);
  readonly selectedDicomIds = signal<string[]>([]);
  readonly isUploading = signal(false);

  constructor() {
    this.loadFiles();
  }

  onSelectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = Array.from(input.files || []);
    const maxBytes = 30 * 1024 * 1024;

    const valid = list.filter((file) => file.size <= maxBytes);

    if (valid.length !== list.length) {
      this.notification
        .builder()
        .warn()
        .summary('Límite de tamaño excedido')
        .detail('Algunos archivos superaban los 30MB y fueron excluidos de la selección.')
        .show();
    }

    this.selectedFiles.set(valid);
  }

  onUploadAll(): void {
    const files = this.selectedFiles();
    if (!files.length) {
      return;
    }

    this.isUploading.set(true);
    const queue = [...files];

    const uploadNext = (): void => {
      const file = queue.shift();
      if (!file) {
        this.isUploading.set(false);
        this.selectedFiles.set([]);
        this.loadFiles();

        this.notification
          .builder()
          .success()
          .summary('Carga Completada')
          .detail('Los documentos fueron encriptados y almacenados en su expediente.')
          .show();
        return;
      }

      this.recordsService.uploadMyFile(file).subscribe({
        next: () => uploadNext(),
        error: () => {
          this.isUploading.set(false);
          this.notification
            .builder()
            .error()
            .summary('Fallo en la transferencia')
            .detail(`No se pudo procesar el archivo: ${file.name}. Verifique su conexión.`)
            .show();
        },
      });
    };

    uploadNext();
  }

  onView(file: PatientMedicalFile): void {
    this.selectedView.set(file);
  }

  onCloseViewer(): void {
    this.selectedView.set(null);
  }

  onDelete(file: PatientMedicalFile): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar permanentemente el documento clínico "${file.original_name}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'bx bx-error-circle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.recordsService.deleteMyFile(file.id).subscribe({
          next: () => {
            this.loadFiles();
            this.notification.builder().success().summary('Documento purgado').show();
          },
          error: () => {
            this.notification
              .builder()
              .warn()
              .summary('Error de eliminación')
              .detail('El sistema no pudo procesar la eliminación. Intente de nuevo.')
              .show();
          },
        });
      },
    });
  }

  toggleDicomSelection(file: PatientMedicalFile): void {
    const current = this.selectedDicomIds();
    if (current.includes(file.id)) {
      this.selectedDicomIds.set(current.filter((id) => id !== file.id));
      return;
    }
    this.selectedDicomIds.set([...current, file.id]);
  }

  isDicomSelected(fileId: string): boolean {
    return this.selectedDicomIds().includes(fileId);
  }

  openSelectedDicomStack(): void {
    const selectedIds = this.selectedDicomIds();
    const dicomCandidates = this.files().filter((file) => selectedIds.includes(file.id));

    if (!dicomCandidates.length) {
      this.notification
        .builder()
        .warn()
        .summary('Selección Inválida')
        .detail('Debe marcar al menos un estudio DICOM para procesar el stack volumétrico.')
        .show();
      return;
    }

    this.onView(dicomCandidates[0]);
  }

  getViewerUrl(file: PatientMedicalFile): string {
    return this.recordsService.getMyFileContentUrl(file.id);
  }

  isImage(file: PatientMedicalFile): boolean {
    return file.content_type.startsWith('image/');
  }

  isPdf(file: PatientMedicalFile): boolean {
    return file.content_type === 'application/pdf';
  }

  isDicom(file: PatientMedicalFile): boolean {
    return file.extension === 'dcm' || file.content_type.includes('dicom');
  }

  isDocx(file: PatientMedicalFile): boolean {
    const ext = file.extension.toLowerCase();
    return ext === 'doc' || ext === 'docx';
  }

  selectedDicomUrls(): string[] {
    const selectedIds = this.selectedDicomIds();
    const selected = this.files().filter(
      (file) => selectedIds.includes(file.id) && this.isDicom(file),
    );

    if (selected.length) {
      return selected.map((file) => this.getViewerUrl(file));
    }

    const current = this.selectedView();
    if (current && this.isDicom(current)) {
      return [this.getViewerUrl(current)];
    }

    return [];
  }

  private loadFiles(): void {
    this.recordsService.listMyFiles().subscribe({
      next: (rows) => this.files.set(rows),
      error: () => {
        this.notification
          .builder()
          .error()
          .summary('Fallo de conexión')
          .detail('No se pudo establecer contacto con el archivo clínico central.')
          .show();
      },
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MedicalRecordsService } from '@core/services/medical-records';
import { NotificationService } from '@core/services/notification';
import { PatientMedicalFile } from '@core/models/medical-records.model';
import { DicomAdvancedViewer } from '@shared/components/file-viewers/dicom-advanced-viewer/dicom-advanced-viewer';
import { DocxViewer } from '@shared/components/file-viewers/docx-viewer/docx-viewer';
import { GenericViewer } from '@shared/components/file-viewers/generic-viewer/generic-viewer';
import { ImageViewer } from '@shared/components/file-viewers/image-viewer/image-viewer';
import { PdfViewer } from '@shared/components/file-viewers/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-document-center',
  imports: [DatePipe, DecimalPipe, DicomAdvancedViewer, DocxViewer, GenericViewer, ImageViewer, PdfViewer],
  templateUrl: './document-center.html',
  styleUrl: './document-center.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocumentCenter {
  private recordsService = inject(MedicalRecordsService);
  private notification = inject(NotificationService);

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
        .summary('Algunos archivos exceden 30MB')
        .detail('Solo se tomaron archivos dentro del limite permitido.')
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
          .summary('Archivos cargados')
          .detail('Tus archivos fueron almacenados correctamente.')
          .show();
        return;
      }
      this.recordsService.uploadMyFile(file).subscribe({
        next: () => uploadNext(),
        error: () => {
          this.isUploading.set(false);
          this.notification
            .builder()
            .warn()
            .summary('No se pudo subir un archivo')
            .detail('Revisa formato/tamaño e intenta nuevamente.')
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
    const accepted = window.confirm(`¿Eliminar el archivo ${file.original_name}?`);
    if (!accepted) {
      return;
    }

    this.recordsService.deleteMyFile(file.id).subscribe({
      next: () => {
        this.loadFiles();
        this.notification.builder().success().summary('Archivo eliminado').show();
      },
      error: () => {
        this.notification
          .builder()
          .warn()
          .summary('No se pudo eliminar')
          .detail('Intenta nuevamente en unos segundos.')
          .show();
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
        .summary('Selecciona al menos un archivo DICOM')
        .detail('Marca uno o más DICOM para abrir el stack de imágenes.')
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
    const selected = this.files().filter((file) => selectedIds.includes(file.id) && this.isDicom(file));
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
          .warn()
          .summary('No se pudieron cargar archivos')
          .detail('Intenta nuevamente en unos segundos.')
          .show();
      },
    });
  }
}

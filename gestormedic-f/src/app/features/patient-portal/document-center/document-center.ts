import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-document-center',
  imports: [],
  templateUrl: './document-center.html',
  styleUrl: './document-center.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocumentCenter {
  readonly folders = signal([
    { name: 'Analisis clinicos', files: 12, updated: 'Hoy' },
    { name: 'Imagenes diagnosticas', files: 8, updated: 'Ayer' },
    { name: 'Consentimientos informados', files: 5, updated: '02 Abr' },
    { name: 'Documentacion personal', files: 3, updated: '01 Abr' },
  ]);

  readonly recentFiles = signal([
    'Perfil-lipidico-abril-2026.pdf',
    'Ecografia-abdominal-marzo.jpg',
    'Consentimiento-cirugia-menor.pdf',
  ]);
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-videocall-features',
  imports: [],
  templateUrl: './videocall-features.html',
  styleUrl: './videocall-features.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-videocall-features-host' },
})
export class VideocallFeatures {
  features = signal([
    { id: 'secure', title: 'Conexión cifrada', desc: 'Canal seguro con trazabilidad clínica' },
    { id: 'record', title: 'Grabación opcional', desc: 'Registro de sesiones con consentimiento' },
    { id: 'whiteboard', title: 'Compartir estudios', desc: 'Comparte imágenes y reportes en tiempo real' },
    { id: 'prescriptions', title: 'Recetas digitales', desc: 'Emisión y envío de recetas certificadas' },
  ]);
}

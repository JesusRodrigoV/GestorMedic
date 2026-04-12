import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-prescriptions-features',
  imports: [],
  templateUrl: './prescriptions-features.html',
  styleUrl: './prescriptions-features.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-prescriptions-features-host' },
})
export class PrescriptionsFeatures {
  features = signal([
    { id: 'signed', title: 'Firma profesional', desc: 'Recetas firmadas digitalmente por el profesional.' },
    { id: 'secure-send', title: 'Envío seguro', desc: 'Entrega cifrada por email o en la app del paciente.' },
    { id: 'autosuggest', title: 'Sugerencias inteligentes', desc: 'Sugerencias de dosis y protocolos según especialidad.' },
    { id: 'tracking', title: 'Seguimiento', desc: 'Estado de entrega y cumplimiento del tratamiento.' },
  ]);
}

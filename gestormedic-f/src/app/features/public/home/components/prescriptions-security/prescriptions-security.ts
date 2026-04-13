import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-prescriptions-security',
  imports: [],
  templateUrl: './prescriptions-security.html',
  styleUrl: './prescriptions-security.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-prescriptions-security-host' },
})
export class PrescriptionsSecurity {
  items = signal([
    { id: 'auth', title: 'Autenticación del emisor' },
    { id: 'audit', title: 'Registro de emisión' },
    { id: 'privacy', title: 'Protección de datos del paciente' },
  ]);
}

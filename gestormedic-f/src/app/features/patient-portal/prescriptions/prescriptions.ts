import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-prescriptions',
  imports: [],
  templateUrl: './prescriptions.html',
  styleUrl: './prescriptions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Prescriptions {
  readonly activePrescriptions = signal([
    {
      medication: 'Losartan 50mg',
      dosage: '1 comprimido cada 24h',
      duration: '30 dias',
      renewal: '15 Abr 2026',
    },
    {
      medication: 'Atorvastatina 20mg',
      dosage: '1 comprimido nocturno',
      duration: '90 dias',
      renewal: '28 May 2026',
    },
  ]);
}

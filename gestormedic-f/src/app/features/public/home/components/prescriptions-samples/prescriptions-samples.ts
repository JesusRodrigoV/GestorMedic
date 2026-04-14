import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-prescriptions-samples',
  imports: [],
  templateUrl: './prescriptions-samples.html',
  styleUrl: './prescriptions-samples.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-prescriptions-samples-host' },
})
export class PrescriptionsSamples {
  samples = signal([
    { id: 'sample-1', title: 'Receta simple', items: ['Paracetamol 500mg', 'Tomar 1 cada 8h por 5 días'] },
    { id: 'sample-2', title: 'Receta crónica', items: ['Enalapril 10mg', 'Tomar 1 cada 24h'] },
  ]);
}

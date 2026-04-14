import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-insurance',
  imports: [],
  templateUrl: './insurance.html',
  styleUrl: './insurance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Insurance {
  readonly plans = signal([
    { provider: 'Seguros VidaPlena', plan: 'Integral Familiar', coverage: '85%', status: 'Activo' },
    { provider: 'Salud Protegida', plan: 'Complementario', coverage: '60%', status: 'En revision' },
  ]);
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-trust-bar',
  imports: [],
  templateUrl: './trust-bar.html',
  styleUrl: './trust-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-trust-bar-host',
  },
})
export class TrustBar {
  pillars = signal([
    {
      value: 'Nube',
      label: 'Sincronización',
      subLabel: 'Acceso en tiempo real',
      icon: 'bx-cloud-upload',
    },
    {
      value: '100%',
      label: 'Cero Papel',
      subLabel: 'Digitalización total',
      icon: 'bx-file',
    },
    {
      value: 'Base',
      label: 'Plan Esencial',
      subLabel: 'Funciones fundamentales',
      icon: 'bx-layer',
    },
    {
      value: 'Privado',
      label: 'Resguardo de Datos',
      subLabel: 'Privacidad clínica',
      icon: 'bx-shield-quarter',
    },
  ]);
}

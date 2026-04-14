import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-reminders',
  imports: [],
  templateUrl: './reminders.html',
  styleUrl: './reminders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Reminders {
  readonly channels = signal([
    { name: 'WhatsApp', enabled: true, frequency: '24h antes de la cita' },
    { name: 'Email', enabled: true, frequency: 'Resumen semanal' },
    { name: 'SMS', enabled: false, frequency: 'Solo urgencias' },
  ]);

  readonly campaigns = signal([
    'Recordatorio de control cardiologico',
    'Campana de vacunacion estacional',
    'Promocion de chequeo anual',
  ]);
}

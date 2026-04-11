import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RoundedButton } from '@shared/ui/rounded-button';

@Component({
  selector: 'gm-subscription-plans',
  imports: [RoundedButton],
  templateUrl: './subscription-plans.html',
  styleUrl: './subscription-plans.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-plans-host',
  },
})
export class SubscriptionPlans {
  protected readonly basicFeatures = signal([
    'Registro de historias clínicas',
    'Agendamiento esencial',
    'Gestión documental básica',
    'Acceso 100% en la nube',
  ]);

  protected readonly proFeatures = signal([
    'Automatización de Marketing (WhatsApp)',
    'Módulo Financiero Avanzado',
    'Liquidaciones con Aseguradoras',
    'Organización por carpetas complejas',
    'Soporte técnico prioritario',
  ]);
}

import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { NotificationService } from '@core/services/notification';
import { Hero } from './components/hero';
import { TrustBar } from './components/trust-bar';
import { EcosystemDual } from './components/ecosystem-dual';
import { SpecialtyDomains } from './components/specialty-domains';
import { SubscriptionPlans } from './components/subscription-plans';
import { FinalCta } from './components/final-cta';
import { FaqObjections } from './components/faq-objections';

@Component({
  selector: 'gm-home',
  imports: [
    AnimateOnScrollModule,
    Hero,
    TrustBar,
    EcosystemDual,
    SpecialtyDomains,
    SubscriptionPlans,
    FinalCta,
    FaqObjections,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-home-host',
  },
})
export default class Home {
  notification = inject(NotificationService);

  features = signal([
    { title: 'Historial Universal', icon: 'bx-folder' },
    { title: 'Agenda Smart', icon: 'bx-calendar' },
    { title: 'Finanzas 360', icon: 'bx-wallet' },
  ]);

  onStartTrial(): void {
    this.notification
      .builder()
      .success()
      .summary('Soberanía Operativa')
      .detail('Preparando su entorno seguro.')
      .show();
  }
}

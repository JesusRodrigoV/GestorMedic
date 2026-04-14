import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-billing',
  imports: [],
  templateUrl: './billing.html',
  styleUrl: './billing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Billing {
  readonly invoices = signal([
    { code: 'FAC-2026-0189', amount: 'Bs 380', date: '05 Abr 2026', status: 'Pagada' },
    { code: 'FAC-2026-0171', amount: 'Bs 250', date: '28 Mar 2026', status: 'Pendiente' },
    { code: 'FAC-2026-0158', amount: 'Bs 420', date: '18 Mar 2026', status: 'Pagada' },
  ]);
}

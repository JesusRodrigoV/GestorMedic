import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'gm-prescriptions-cta',
  imports: [],
  templateUrl: './prescriptions-cta.html',
  styleUrl: './prescriptions-cta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-prescriptions-cta-host' },
})
export class PrescriptionsCta {}

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'gm-about-cta',
  standalone: true,
  imports: [],
  templateUrl: './about-cta.html',
  styleUrl: './about-cta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-about-cta-host' },
})
export class AboutCta {}

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'gm-about-stats',
  standalone: true,
  imports: [],
  templateUrl: './about-stats.html',
  styleUrl: './about-stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-about-stats-host' },
})
export class AboutStats {}

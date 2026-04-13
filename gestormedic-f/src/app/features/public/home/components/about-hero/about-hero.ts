import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'gm-about-hero',
  standalone: true,
  imports: [],
  templateUrl: './about-hero.html',
  styleUrl: './about-hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-about-hero-host' },
})
export class AboutHero {}

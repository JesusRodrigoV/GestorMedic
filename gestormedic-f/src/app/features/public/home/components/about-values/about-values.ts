import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'gm-about-values',
  standalone: true,
  imports: [],
  templateUrl: './about-values.html',
  styleUrl: './about-values.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-about-values-host' },
})
export class AboutValues {}

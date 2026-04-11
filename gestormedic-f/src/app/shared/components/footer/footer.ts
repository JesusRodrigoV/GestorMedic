import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'gm-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-footer-public-host',
  },
})
export class Footer {
  currentYear = signal(new Date().getFullYear());

  protected readonly socialLinks = signal([
    { label: 'Facebook', icon: 'bxl-facebook-circle', url: '#' },
    { label: 'X', icon: 'bxl-twitter', url: '#' },
    { label: 'LinkedIn', icon: 'bxl-linkedin-square', url: '#' },
    { label: 'YouTube', icon: 'bxl-youtube', url: '#' },
  ]);
}

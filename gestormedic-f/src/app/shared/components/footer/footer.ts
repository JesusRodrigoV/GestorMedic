import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'gm-footer',
  imports: [NgOptimizedImage, RouterLink],
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
    { label: 'Instagram', icon: 'bxl-instagram', url: '#' },
    { label: 'LinkedIn', icon: 'bxl-linkedin-square', url: '#' },
  ]);
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'gm-appearance',
  imports: [FormsModule, ToggleSwitchModule],
  templateUrl: './appearance.html',
  styleUrl: './appearance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Appearance {
  isDarkActive = signal(false);

  onToggleTheme(): void {
    this.isDarkActive.set(!this.isDarkActive());
    console.log('Theme toggled:', this.isDarkActive());
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Theme } from '@core/services/theme';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'gm-appearance',
  imports: [FormsModule, ToggleSwitchModule],
  templateUrl: './appearance.html',
  styleUrl: './appearance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Appearance {
  private themeService = inject(Theme);
  isDarkActive = this.themeService.isDarkMode;

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

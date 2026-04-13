import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Theme } from '@core/services/theme';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CommonModule } from '@angular/common';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationService } from '@core/services/notification';
import { AccentPreference, DensityPreference, ThemePreference } from '@core/models/auth.model';

@Component({
  selector: 'gm-appearance',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleSwitchModule, RoundedButton],
  templateUrl: './appearance.html',
  styleUrl: './appearance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Appearance {
  private themeService = inject(Theme);
  authStore = inject(AuthStore);
  private notification = inject(NotificationService);

  user = this.authStore.user;
  isDarkActive = signal(false);

  accentColors = [
    { name: 'Energy (Azul)', value: 'energy', color: '#4a90e2' },
    { name: 'Emerald (Verde)', value: 'emerald', color: '#10b981' },
    { name: 'Violet (Morado)', value: 'violet', color: '#8b5cf6' },
    { name: 'Rose (Rosa)', value: 'rose', color: '#f43f5e' }
  ] as const;

  selectedAccent = signal<AccentPreference>('energy');
  selectedDensity = signal<DensityPreference>('standard');

  constructor() {
    effect(() => {
      const data = this.user();
      if (!data) {
        return;
      }

      this.isDarkActive.set(data.appearance_theme === 'dark');
      this.selectedAccent.set(data.appearance_accent_color);
      this.selectedDensity.set(data.appearance_density);
      this.themeService.setTheme(data.appearance_theme);
    });
  }

  onToggleTheme(isDarkMode: boolean): void {
    this.isDarkActive.set(isDarkMode);
    this.themeService.setTheme(isDarkMode ? 'dark' : 'light');
  }

  onAccentChange(color: AccentPreference) {
    this.selectedAccent.set(color);
  }

  onDensityChange(density: DensityPreference) {
    this.selectedDensity.set(density);
  }

  onSave(): void {
    const payload = {
      theme: (this.isDarkActive() ? 'dark' : 'light') as ThemePreference,
      accent_color: this.selectedAccent(),
      density: this.selectedDensity(),
    };

    this.authStore.updateAppearancePreferences(payload).subscribe({
      next: () => {
        this.notification
          .builder()
          .success()
          .summary('Apariencia actualizada')
          .detail('Tus preferencias visuales se guardaron correctamente.')
          .show();
      },
      error: () => {
        this.notification
          .builder()
          .error()
          .summary('Error')
          .detail('No se pudieron guardar las preferencias de apariencia.')
          .show();
      },
    });
  }
}

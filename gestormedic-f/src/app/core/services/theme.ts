import { isPlatformBrowser } from '@angular/common';
import { computed, DOCUMENT, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Tema = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);

  private readonly THEME_KEY = 'gm_theme_preference';
  private readonly DARK_CLASS = 'dark-mode';

  private readonly _currentTheme = signal<Tema>('light');

  public readonly isDarkMode = computed(() => this._currentTheme() === 'dark');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    if (isPlatformBrowser(this._platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY) as Tema;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      const themeToApply = savedTheme || (prefersDark ? 'dark' : 'light');
      this.setTheme(themeToApply);
    }
  }

  public toggleTheme(): void {
    this.setTheme(this._currentTheme() === 'light' ? 'dark' : 'light');
  }

  public setTheme(theme: Tema): void {
    this._currentTheme.set(theme);

    if (isPlatformBrowser(this._platformId)) {
      localStorage.setItem(this.THEME_KEY, theme);

      if (theme === 'dark') {
        this._document.documentElement.classList.add(this.DARK_CLASS);
      } else {
        this._document.documentElement.classList.remove(this.DARK_CLASS);
      }
    }
  }
}

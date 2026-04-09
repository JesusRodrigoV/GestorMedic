import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SettingsOption } from '@core/models/menu-options';

@Component({
  selector: 'gm-settings',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Settings {
  menuOptions = signal<SettingsOption[]>([
    {
      label: 'Perfil Profesional',
      icon: 'bx bx-user-circle',
      route: 'profile',
    },
    {
      label: 'Notificaciones',
      icon: 'bx bx-bell',
      route: 'notifications',
    },
    {
      label: 'Apariencia',
      icon: 'bx bx-palette',
      route: 'appearance',
    },
  ]);
}

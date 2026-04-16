import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingsOption } from '@core/models/menu-options';

@Component({
  selector: 'gm-settings',
  imports: [RouterModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Settings {
  menuOptions = signal<SettingsOption[]>([
    {
      label: 'Perfil',
      icon: 'bx bx-user-circle',
      route: 'profile',
    },
    {
      label: 'Seguridad', 
      icon: 'bx bx-shield-quarter',
      route: 'security',
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

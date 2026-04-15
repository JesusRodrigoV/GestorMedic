import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'gm-notifications',
  imports: [ReactiveFormsModule, ToggleSwitchModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Notifications {
  private fb = inject(FormBuilder);

  configForm = this.fb.nonNullable.group({
    whatsappAlerts: [true],
    emailAlerts: [true],
  });

  onSave(): void {
    console.log('Configuración de notificaciones actualizada');
  }
}

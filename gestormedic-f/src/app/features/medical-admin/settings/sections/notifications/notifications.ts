import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { AuthStore } from '@features/auth/stores/auth.store';

@Component({
  selector: 'gm-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToggleSwitchModule, RoundedButton],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Notifications {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  authStore = inject(AuthStore);
  user = this.authStore.user;

  configForm = this.fb.nonNullable.group({
    // Citas
    newAppointment: [true],
    appointmentReminder: [true],
    appointmentCancellation: [true],
    // Comunicación
    whatsappAlerts: [true],
    emailAlerts: [true],
    marketingEmails: [false],
    // Seguridad
    loginAlerts: [true],
    passwordChanges: [true]
  });

  constructor() {
    effect(() => {
      const data = this.user();
      if (!data) {
        return;
      }

      this.configForm.patchValue({
        newAppointment: data.notification_new_appointment,
        appointmentReminder: data.notification_appointment_reminder,
        appointmentCancellation: data.notification_appointment_cancellation,
        whatsappAlerts: data.notification_whatsapp_alerts,
        emailAlerts: data.notification_email_alerts,
        marketingEmails: data.notification_marketing_emails,
        loginAlerts: data.notification_login_alerts,
        passwordChanges: data.notification_password_changes,
      });
    });
  }

  onSave(): void {
    this.authStore.updateNotificationPreferences(this.configForm.getRawValue()).subscribe({
      next: () => {
        this.notification
          .builder()
          .success()
          .summary('Preferencias guardadas')
          .detail('Tus ajustes de notificación han sido actualizados.')
          .show();
      },
      error: () => {
        this.notification
          .builder()
          .error()
          .summary('Error')
          .detail('No se pudo guardar tu configuración de notificaciones.')
          .show();
      },
    });
  }
}

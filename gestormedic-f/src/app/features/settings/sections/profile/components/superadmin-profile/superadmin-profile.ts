import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationService } from '@core/services/notification';
import { environment } from '@env/environment';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';

@Component({
  selector: 'gm-superadmin-profile',
  imports: [ReactiveFormsModule, InputTextModule, RoundedButton],
  templateUrl: './superadmin-profile.html',
  styleUrl: './superadmin-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperadminProfile {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private notification = inject(NotificationService);

  isProcessing = signal(false);

  profileForm = this.fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.minLength(2)]],
    last_name: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    username: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit(): void {
    const user = this.authStore.currentUser();
    if (user) {
      this.profileForm.patchValue({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  }

  async onSave(): Promise<void> {
    if (this.profileForm.invalid) {
      this.notification
        .builder()
        .warn()
        .summary('Formulario inválido')
        .detail('Revise los campos requeridos.')
        .show();
      return;
    }

    this.isProcessing.set(true);
    const payload = this.profileForm.getRawValue();

    try {
      await firstValueFrom(this.http.put(`${environment.apiUrl}/users/me`, payload));

      this.notification
        .builder()
        .success()
        .summary('Identidad actualizada')
        .detail('Los datos del perfil central han sido modificados con éxito.')
        .show();

      this.authStore.fetchUser();
    } catch (error: any) {
      const detail = error?.error?.detail || 'No se pudo actualizar la identidad.';
      this.notification.builder().error().summary('Error de actualización').detail(detail).show();
    } finally {
      this.isProcessing.set(false);
    }
  }
}

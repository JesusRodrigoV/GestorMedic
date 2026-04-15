import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthStore } from '@features/auth/stores/auth.store';
import { Auth } from '@core/services/auth';
import { NotificationService } from '@core/services/notification';
import { environment } from '@env/environment';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'gm-register-clinic',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    RoundedButton,
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: './register-clinic.html',
  styleUrl: './register-clinic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterClinic {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private authStore = inject(AuthStore);
  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isProcessing = signal(false);

  registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],

    clinic_name: ['', [Validators.required]],
    nit_ruc: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required]],
  });

  async executeRegistrationFlow() {
    if (this.registerForm.invalid) return;

    this.isProcessing.set(true);
    const formValues = this.registerForm.getRawValue();

    try {
      const userPayload = {
        email: formValues.email,
        username: formValues.email.split('@')[0],
        password: formValues.password,
        first_name: formValues.firstName,
        last_name: formValues.lastName,
      };

      await firstValueFrom(this.authService.register(userPayload));

      const loginRes = await firstValueFrom(
        this.authService.login({
          username: userPayload.email,
          password: userPayload.password,
        }),
      );

      localStorage.setItem('gm_token', loginRes.access_token);

      const clinicPayload = {
        name: formValues.clinic_name,
        nit_ruc: formValues.nit_ruc,
        address: formValues.address,
        phone: formValues.phone,
        logo_url: null,
        plan: 'free',
      };

      await firstValueFrom(this.http.post(`${environment.apiUrl}/clinics/`, clinicPayload));

      this.notification
        .builder()
        .success()
        .summary('Infraestructura inicializada con éxito.')
        .show();
      this.authStore.fetchUser();
    } catch (error: any) {
      console.error('Fallo en la cadena de registro:', error);
      this.notification.builder().error().summary('Error en el protocolo de registro.').show();
    } finally {
      this.isProcessing.set(false);
    }
  }
}

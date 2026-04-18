import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TextareaModule } from 'primeng/textarea';
import { AuthStore } from '@features/auth/stores/auth.store';
import { Auth } from '@core/services/auth-service';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { NgOptimizedImage } from '@angular/common';
import { ProfileDoctorService } from '@core/services/profile-doctor-service';

@Component({
  selector: 'gm-register-doctor',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    TextareaModule,
    RoundedButton,
    NgOptimizedImage,
  ],
  templateUrl: './register-doctor.html',
  styleUrl: './register-doctor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterDoctor {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private authStore = inject(AuthStore);
  private profileDoctorService = inject(ProfileDoctorService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isProcessing = signal(false);

  registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    professional_license: ['', [Validators.required, /*Validators.pattern(/^[A-Z0-9\-]{5,20}$/)*/]],
    phone: ['', [Validators.required, Validators.pattern(/^[+\d\s\-()]+$/)]],
    experience_years: [0, [Validators.required, Validators.min(0), Validators.max(70)]],
    bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  async executeRegistrationFlow() {
    if (this.registerForm.invalid) {
      this.notification.builder().warn().summary('Por favor, revise todos los campos').show();
      return;
    }

    this.isProcessing.set(true);
    const formValues = this.registerForm.getRawValue();

    try {
      // 1. Crear identidad básica
      const userPayload = {
        email: formValues.email,
        username: formValues.email.split('@')[0],
        password: formValues.password,
        first_name: formValues.firstName,
        last_name: formValues.lastName,
      };

      await firstValueFrom(this.authService.register(userPayload));

      // 2. Iniciar sesión automáticamente (usando email, no username)
      const loginRes = await firstValueFrom(
        this.authService.login({
          email: userPayload.email,
          password: userPayload.password,
        }),
      );

      localStorage.setItem('gm_token', loginRes.access_token!);

      // 3. Configurar el perfil médico inicial (Sin especialidades por ahora, evitar 422)
      const doctorPayload = {
        license_number: formValues.professional_license,
        bio: formValues.bio,
        experience_years: Number(formValues.experience_years),
        signature_url: '',
        base_consultation_price: 0,
        is_telemedicine_enabled: false,
        user_id: 0,
        specialty_ids: [],
      };

      await firstValueFrom(this.profileDoctorService.createOnboarding(doctorPayload));

      this.notification
        .builder()
        .success()
        .summary('¡Bienvenido a GestorMedic!')
        .detail('Tu perfil profesional ha sido creado exitosamente.')
        .show();

      this.authStore.fetchUser();
    } catch (error: any) {
      console.error('Error en registro:', error);
      this.notification
        .builder()
        .error()
        .summary('Error en el registro')
        .detail(error?.error?.detail || 'Fallo de validación en el servidor.')
        .show();
    } finally {
      this.isProcessing.set(false);
    }
  }
}

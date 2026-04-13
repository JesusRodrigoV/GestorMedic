import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TextareaModule } from 'primeng/textarea';
import { AuthStore } from '@features/auth/stores/auth.store';
import { Auth } from '@core/services/auth';
import { NotificationService } from '@core/services/notification';
import { environment } from '@env/environment';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'gm-register-doctor',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    TextareaModule,
    RoundedButton,
    RouterLink,
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
  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isProcessing = signal(false);

  // Un solo formulario que agrupa datos personales y profesionales
  registerForm = this.fb.nonNullable.group({
    // Datos del Médico (User)
    full_name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],

    // Datos Profesionales (Doctor Profile)
    specialties: ['', [Validators.required]],
    professional_license: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-]{5,20}$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+\d\s\-()]+$/)]],
    university: ['', [Validators.required, Validators.minLength(3)]],
    experience_years: [
      '',
      [Validators.required, Validators.min(0), Validators.max(70)],
    ],
    bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  async executeRegistrationFlow() {
    if (this.registerForm.invalid) {
      this.notification
        .builder()
        .warn()
        .summary('Por favor, revise todos los campos')
        .show();
      return;
    }

    this.isProcessing.set(true);
    const formValues = this.registerForm.getRawValue();

    try {
      // PASO 1: Crear la Identidad del Médico
      const userPayload = {
        email: formValues.email,
        username: formValues.email.split('@')[0],
        password: formValues.password,
        first_name: formValues.full_name,
        role_id: 3, // Asumiendo que 3 es DOCTOR
      };

      await firstValueFrom(this.authService.register(userPayload));

      // PASO 2: Autenticación Táctica (Obtener Token)
      const loginRes = await firstValueFrom(
        this.authService.login({
          username: userPayload.email,
          password: userPayload.password,
        }),
      );

      localStorage.setItem('gm_token', loginRes.access_token);

      // PASO 3: Registrar el Perfil Médico (Ahora sí tenemos autorización)
      const doctorPayload = {
        specialties: formValues.specialties,
        professional_license: formValues.professional_license,
        phone: formValues.phone,
        university: formValues.university,
        experience_years: parseInt(formValues.experience_years),
        bio: formValues.bio,
        avatar_url: null,
        is_available: true,
      };

      await firstValueFrom(this.http.post(`${environment.apiUrl}/doctors/`, doctorPayload));

      // PASO FINAL: Hidratar el Store y redirigir
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
        .detail(
          error?.error?.detail || 'Por favor, intenta nuevamente o contacta al soporte.',
        )
        .show();

      this.isProcessing.set(false);
    }
  }
}

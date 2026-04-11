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

  // Un solo formulario que agrupa ambas dimensiones
  registerForm = this.fb.nonNullable.group({
    // Datos del Representante (User)
    admin_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],

    // Datos de la Institución (Clinic)
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
      // PASO 1: Crear la Identidad del Administrador
      const userPayload = {
        email: formValues.email,
        username: formValues.email.split('@')[0], // Generamos un username base
        password: formValues.password,
        first_name: formValues.admin_name,
        role_id: 2, // Asumiendo que 2 es ADMIN_CLINICA según tu BD previa
      };

      await firstValueFrom(this.authService.register(userPayload));

      // PASO 2: Autenticación Táctica (Obtener Token)
      // Login devuelve el token y el AuthStore lo guarda en localStorage
      const loginRes = await firstValueFrom(
        this.authService.login({
          username: userPayload.email, // FastAPI usa username para el login form
          password: userPayload.password,
        }),
      );

      localStorage.setItem('gm_token', loginRes.access_token);

      // PASO 3: Registrar la Clínica (Ahora sí tenemos autorización)
      const clinicPayload = {
        name: formValues.clinic_name,
        nit_ruc: formValues.nit_ruc,
        address: formValues.address,
        phone: formValues.phone,
        logo_url: null,
        plan: 'free',
      };

      await firstValueFrom(this.http.post(`${environment.apiUrl}/clinics/`, clinicPayload));

      // PASO FINAL: Hidratar el Store y redirigir
      this.notification
        .builder()
        .success()
        .summary('Infraestructura inicializada con éxito.')
        .show();
      this.authStore.fetchUser();
      // fetchUser ya incluye la redirección al dashboard en tu AuthStore
    } catch (error: any) {
      console.error('Fallo en la cadena de registro:', error);
      this.notification.builder().error().summary('Error en el protocolo de registro.').show();
    } finally {
      this.isProcessing.set(false);
    }
  }
}

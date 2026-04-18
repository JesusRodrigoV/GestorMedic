import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { StepperModule } from 'primeng/stepper';
import { NgOptimizedImage } from '@angular/common';
import { AuthStore } from '@features/auth/stores/auth.store';
import { Auth } from '@core/services/auth-service';
import { ClinicsService } from '@core/services/clinics-service';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';

@Component({
  selector: 'gm-register-clinic',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    RoundedButton,
    RouterLink,
    NgOptimizedImage,
    StepperModule,
  ],
  templateUrl: './register-clinic.html',
  styleUrl: './register-clinic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterClinic {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private authStore = inject(AuthStore);
  private clinicsService = inject(ClinicsService);
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

  step = signal(1);

  nextStep(): void {
    if (this.isStepOneValid()) {
      this.step.set(2);
    } else {
      this.registerForm.get('firstName')?.markAsTouched();
      this.registerForm.get('lastName')?.markAsTouched();
      this.registerForm.get('email')?.markAsTouched();
      this.registerForm.get('password')?.markAsTouched();
    }
  }

  prevStep(): void {
    this.step.set(1);
  }

  isStepOneValid(): boolean {
    const firstName = this.registerForm.get('firstName');
    const lastName = this.registerForm.get('lastName');
    const email = this.registerForm.get('email');
    const password = this.registerForm.get('password');

    return !!(firstName?.valid && lastName?.valid && email?.valid && password?.valid);
  }

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
          email: userPayload.email,
          password: userPayload.password,
        }),
      );

      localStorage.setItem('gm_token', loginRes.access_token!);

      const clinicPayload = {
        name: formValues.clinic_name,
        nit_ruc: formValues.nit_ruc,
        address: formValues.address,
        phone: formValues.phone,
        logo_url: '',
        plan: 'free',
        is_active: true,
      };

      await firstValueFrom(this.clinicsService.createOnboarding(clinicPayload));

      this.notification
        .builder()
        .success()
        .summary('Infraestructura inicializada con éxito.')
        .show();

      this.authStore.fetchUser();
    } catch (error: any) {
      const msg = error.error?.detail || 'Error en el protocolo de registro.';
      this.notification.builder().error().summary('Operación fallida').detail(msg).show();
    } finally {
      this.isProcessing.set(false);
    }
  }
}

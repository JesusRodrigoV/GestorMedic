import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { NgOptimizedImage } from '@angular/common';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { NotificationService } from '@core/services/notification';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'gm-register-patient',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    MessageModule,
    ButtonModule,
    DividerModule,
    NgOptimizedImage,
    RoundedButton,
  ],
  templateUrl: './register-patient.html',
  styleUrl: './register-patient.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterPatient {
  fb = inject(FormBuilder);
  notification = inject(NotificationService);
  authStore = inject(AuthStore);

  formSubmitted = signal(false);

  strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.minLength(8)],
    ],
  });

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control?.invalid && (control.touched || this.formSubmitted()));
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control?.hasError(errorCode) && (control.touched || this.formSubmitted()));
  }

  onRegister(): void {
    this.formSubmitted.set(true);

    if (this.registerForm.invalid) {
      console.warn('Registro fallido, errores del formulario:', {
        formErrors: this.registerForm.errors,
        passwordErrors: this.registerForm.get('password')?.errors,
        firstNameErrors: this.registerForm.get('firstName')?.errors,
        lastNameErrors: this.registerForm.get('lastName')?.errors,
        emailErrors: this.registerForm.get('email')?.errors,
      });

      this.notification
        .builder()
        .warn()
        .summary('Formulario incompleto')
        .detail('Revise los campos marcados en rojo antes de continuar.')
        .show();
      return;
    }

    const { firstName, lastName, email, password } = this.registerForm.getRawValue();

    const generatedUsername = email.split('@')[0];

    this.authStore.register({
      email: email,
      username: generatedUsername,
      first_name: firstName,
      last_name: lastName,
      password: password,
    });
  }

  onGoogleRegister(): void {
    console.log('Redirigiendo a Google OAuth...');
  }
}

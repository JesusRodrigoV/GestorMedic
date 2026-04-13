import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { NgOptimizedImage } from '@angular/common';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { Auth } from '@core/services/auth';
import { NotificationService } from '@core/services/notification';

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
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isProcessing = signal(false);
  formSubmitted = signal(false);

  // Expresión regular: Al menos 1 mayúscula, 1 número y 1 carácter especial
  strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

  registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.minLength(10), Validators.pattern(this.strongPasswordRegex)],
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

  async onRegister() {
    this.formSubmitted.set(true);

    if (this.registerForm.invalid) {
      return;
    }

    this.isProcessing.set(true);

    const { fullName, email, password } = this.registerForm.getRawValue();
    const [firstName, ...rest] = fullName.trim().split(' ');
    const lastName = rest.join(' ');

    this.auth
      .register({
        email,
        username: email.split('@')[0],
        password,
        first_name: firstName,
        last_name: lastName,
        role_id: 3,
      })
      .subscribe({
        next: () => {
          this.notification
            .builder()
            .success()
            .summary('Cuenta creada')
            .detail('Tu cuenta de paciente fue creada. Ahora puedes iniciar sesión.')
            .show();
          this.isProcessing.set(false);
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.notification
            .builder()
            .error()
            .summary('Registro fallido')
            .detail('No se pudo crear la cuenta de paciente.')
            .show();
          this.isProcessing.set(false);
        },
      });
  }

  onGoogleRegister() {
    console.log('Redirigiendo a Google OAuth...');
  }
}

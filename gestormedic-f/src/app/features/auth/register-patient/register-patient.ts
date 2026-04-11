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

    // Aquí iría la lógica de AuthStore para crear el paciente
    console.log('Registrando paciente:', this.registerForm.getRawValue());

    setTimeout(() => {
      this.isProcessing.set(false);
    }, 1500); // Simulación
  }

  onGoogleRegister() {
    console.log('Redirigiendo a Google OAuth...');
  }
}

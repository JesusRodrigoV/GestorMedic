import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { NgOptimizedImage } from '@angular/common';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'gm-login',
  imports: [
    ReactiveFormsModule,
    RoundedButton,
    InputTextModule,
    PasswordModule,
    NgOptimizedImage,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Login {
  _fb = inject(FormBuilder);
  _notification = inject(NotificationService);
  authStore = inject(AuthStore);

  protected readonly loginForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected onLogin(): void {
    if (this.loginForm.invalid) {
      this._notification
        .builder()
        .warn()
        .summary('Por favor, revise los campos del formulario.')
        .show();
      return;
    }

    const credentials = this.loginForm.getRawValue();
    this.authStore.login(credentials);
  }
}

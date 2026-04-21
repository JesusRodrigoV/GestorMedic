import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { NgOptimizedImage } from '@angular/common';
import { AuthStore } from '../stores/auth.store';
import { environment } from '@env/environment';

declare var google: any;

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
  private _fb = inject(FormBuilder);
  private _notification = inject(NotificationService);
  protected authStore = inject(AuthStore);

  protected readonly loginForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleCredentialResponse.bind(this),
      });
    }
  }

  protected onLogin(): void {
    console.log('Intento de login...', this.loginForm.value);
    if (this.loginForm.invalid) {
      console.warn('Formulario inválido:', this.loginForm.errors);
      this._notification.builder().warn().summary('Por favor, revise los campos.').show();
      return;
    }
    console.log('Llamando a authStore.login...');
    this.authStore.login(this.loginForm.getRawValue());
  }

  protected onGoogleLoginTrigger(): void {
    google.accounts.id.prompt();
  }

  private handleCredentialResponse(response: any): void {
    if (response.credential) {
      this.authStore.loginWithGoogle({ credential: response.credential });
    } else {
      this._notification
        .builder()
        .error()
        .summary('Error de autenticación con proveedor externo')
        .show();
    }
  }
}

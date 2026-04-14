import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { InputTextModule } from 'primeng/inputtext';
import { NgOptimizedImage } from '@angular/common';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'gm-forgot-password',
  imports: [
    ReactiveFormsModule,
    RoundedButton,
    InputTextModule,
    NgOptimizedImage,
    RouterLink,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: '../login/login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForgotPassword {
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _notification = inject(NotificationService);
  protected readonly authStore = inject(AuthStore);

  protected readonly forgotForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected onRecover(): void {
    if (this.forgotForm.invalid) {
      this._notification
        .builder()
        .warn()
        .summary('Por favor, ingrese un correo válido.')
        .show();
      return;
    }

    this._notification
      .builder()
      .success()
      .summary('Enlace enviado')
      .detail('Se han enviado las instrucciones a su correo.')
      .show();
      
    this._router.navigate(['/auth/login']);
  }
}

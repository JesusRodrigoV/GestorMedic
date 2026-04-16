import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {  RouterLink } from '@angular/router';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { InputTextModule } from 'primeng/inputtext';
import { NgOptimizedImage } from '@angular/common';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'gm-forgot-password',
  imports: [ReactiveFormsModule, RoundedButton, InputTextModule, NgOptimizedImage, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: '../login/login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForgotPassword {
  _fb = inject(FormBuilder);
 _notification = inject(NotificationService);
 authStore = inject(AuthStore);

 forgotForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected onRecover(): void {
    if (this.forgotForm.invalid) {
      this._notification.builder().warn().summary('Por favor, ingrese un correo válido.').show();
      return;
    }

    this.authStore.requestPasswordReset(this.forgotForm.getRawValue());
  }
}

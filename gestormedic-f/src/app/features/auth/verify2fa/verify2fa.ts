import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'gm-verify2fa',
  imports: [ReactiveFormsModule, RoundedButton, InputTextModule, NgOptimizedImage],
  templateUrl: './verify2fa.html',
  styleUrl: '../login/login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Verify2fa {
  private _fb = inject(FormBuilder);
  private _notification = inject(NotificationService);
  private _router = inject(Router);
  protected authStore = inject(AuthStore);

  protected readonly twoFAForm = this._fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  ngOnInit(): void {
    if (!this.authStore.pendingSessionToken()) {
      this._router.navigate(['/auth/login']);
    }
  }

  protected onVerify(): void {
    if (this.twoFAForm.invalid) {
      this._notification.builder().warn().summary('Ingrese un código válido de 6 dígitos.').show();
      return;
    }

    const sessionToken = this.authStore.pendingSessionToken();
    if (sessionToken) {
      this.authStore.verify2FA({
        sessionToken: sessionToken,
        code: this.twoFAForm.getRawValue().code,
      });
    }
  }

  protected onCancel(): void {
    this.authStore.cancel2FA();
  }
}

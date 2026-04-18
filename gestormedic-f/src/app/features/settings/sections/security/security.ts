import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '@features/auth/stores/auth.store';
import { TwoFactorStore } from '@features/settings/stores/two-factor.store';
import { RoundedButton } from '@shared/ui/rounded-button';
import { InputTextModule } from 'primeng/inputtext';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'gm-security',
  imports: [ReactiveFormsModule, InputTextModule, RoundedButton, QRCodeComponent],
  templateUrl: './security.html',
  styleUrl: './security.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TwoFactorStore],
})
export default class Security implements OnInit {
  protected twoFactorStore = inject(TwoFactorStore);
  protected authStore = inject(AuthStore);
  private fb = inject(FormBuilder);

  protected is2FAEnabled = this.authStore.currentUser()?.is_totp_enabled;

  protected verificationForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  ngOnInit(): void {
    if (!this.is2FAEnabled) {
      this.twoFactorStore.initSetup();
    }
  }

  onConfirmSetup(): void {
    if (this.verificationForm.invalid) return;

    const secret = this.twoFactorStore.secretKey();
    if (!secret) return;

    this.twoFactorStore.confirmSetup({
      code: this.verificationForm.getRawValue().code,
      secret: secret,
    });
  }
}

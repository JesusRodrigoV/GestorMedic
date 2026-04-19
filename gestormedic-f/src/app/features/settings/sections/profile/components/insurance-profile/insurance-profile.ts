import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { MyInsuranceProfileStore } from '@features/settings/stores/my-insurance-profile.store';

@Component({
  selector: 'gm-insurance-profile',
  imports: [ReactiveFormsModule, InputTextModule, RoundedButton],
  templateUrl: './insurance-profile.html',
  styleUrl: './insurance-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MyInsuranceProfileStore],
})
export class InsuranceProfile implements OnInit {
  protected store = inject(MyInsuranceProfileStore);
  private fb = inject(FormBuilder);

  protected profileForm = this.fb.nonNullable.group({
    company_name: ['', [Validators.required]],
    tax_id: ['', [Validators.required]],
    contact_person: ['', [Validators.required]],
    contact_phone: ['', [Validators.required]],
    contact_email: ['', [Validators.required, Validators.email]],
    office_address: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const profile = this.store.currentProfile();
      if (profile) {
        this.profileForm.patchValue({
          company_name: profile.company_name,
          tax_id: profile.tax_id,
          contact_person: profile.contact_person,
          contact_phone: profile.contact_phone,
          contact_email: profile.contact_email,
          office_address: profile.office_address,
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadProfile();
  }

  protected onSave(): void {
    if (this.profileForm.invalid) return;
    this.store.updateProfile(this.profileForm.getRawValue());
  }
}

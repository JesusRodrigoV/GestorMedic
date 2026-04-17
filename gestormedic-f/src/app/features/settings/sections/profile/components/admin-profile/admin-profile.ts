import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { MyStaffProfileStore } from '@features/settings/stores/my-staff-profile.store';

@Component({
  selector: 'gm-admin-profile',
  imports: [ReactiveFormsModule, InputTextModule, RoundedButton],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MyStaffProfileStore],
})
export class AdminProfile {
  protected store = inject(MyStaffProfileStore);
  private fb = inject(FormBuilder);

  protected profileForm = this.fb.nonNullable.group({
    employee_id: ['', [Validators.required]],
    position: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const profile = this.store.currentProfile();
      if (profile) {
        this.profileForm.patchValue({
          employee_id: profile.employee_id,
          position: profile.position,
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

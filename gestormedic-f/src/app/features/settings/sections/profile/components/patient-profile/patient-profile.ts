import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '@features/auth/stores/auth.store';
import { MyPatientProfileStore } from '@features/settings/stores/my-patient-profile.store';
import { RoundedButton } from '@shared/ui/rounded-button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';

export interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  medicalLicenseNumber: string;
  contactEmail: string;
}

@Component({
  selector: 'gm-patient-profile',
  imports: [ReactiveFormsModule, InputTextModule, DividerModule, RoundedButton],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MyPatientProfileStore],
})
export class PatientProfile implements OnInit {
  private fb = inject(FormBuilder);

  protected authStore = inject(AuthStore);
  protected patientStore = inject(MyPatientProfileStore);

  protected patientForm = this.fb.nonNullable.group({
    ci_number: ['', Validators.required],
    date_of_birth: ['', Validators.required],
    gender: ['', Validators.required],
    blood_type: ['', Validators.required],
    allergies: [''],
    occupation: [''],
    emergency_contact_name: ['', Validators.required],
    emergency_contact_phone: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const profileData = this.patientStore.currentProfile();
      if (profileData) {
        this.patientForm.patchValue(profileData);
      }
    });
  }

  ngOnInit(): void {
    this.patientStore.loadProfile();
  }

  onSave(): void {
    if (this.patientForm.invalid) return;

    this.patientStore.updateProfile(this.patientForm.getRawValue());
  }
}

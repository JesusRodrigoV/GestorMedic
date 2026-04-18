import { ChangeDetectionStrategy, Component, effect, inject, OnInit  } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MyPatientProfileStore } from '@features/settings/stores/my-patient-profile.store';
import { RoundedButton } from '@shared/ui/rounded-button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'gm-patient-profile',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    RoundedButton,
  ],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MyPatientProfileStore],
})
export class PatientProfile implements OnInit {
  protected store = inject(MyPatientProfileStore);
  private fb = inject(FormBuilder);

  protected genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otro', value: 'O' },
  ];

  protected bloodTypeOptions = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
    { label: 'Desconocido', value: 'DESC' },
  ];

  protected profileForm = this.fb.nonNullable.group({
    ci_number: ['', [Validators.required]],
    date_of_birth: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    blood_type: ['', [Validators.required]],
    allergies: [''],
    occupation: [''],
    emergency_contact_name: ['', [Validators.required]],
    emergency_contact_phone: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const profile = this.store.currentProfile();
      if (profile) {
        this.profileForm.patchValue({
          ci_number: profile.ci_number,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          blood_type: profile.blood_type,
          allergies: profile.allergies,
          occupation: profile.occupation,
          emergency_contact_name: profile.emergency_contact_name,
          emergency_contact_phone: profile.emergency_contact_phone,
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

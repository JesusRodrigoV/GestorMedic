import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { Specialty } from '@core/models/specialty.model';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MyDoctorProfileStore } from '@features/settings/stores/my-doctor-profile.store';
import { SpecialtiesService } from '@core/services/specialties-service';

@Component({
  selector: 'gm-doctor-profile',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ToggleSwitchModule,
    MultiSelectModule,
    RoundedButton,
  ],
  templateUrl: './doctor-profile.html',
  styleUrl: './doctor-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MyDoctorProfileStore],
})
export class DoctorProfile implements OnInit {
  protected store = inject(MyDoctorProfileStore);
  private specialtiesService = inject(SpecialtiesService);
  private fb = inject(FormBuilder);

  protected availableSpecialties = signal<Specialty[]>([]);

  protected profileForm = this.fb.nonNullable.group({
    license_number: ['', [Validators.required]],
    bio: [''],
    experience_years: [0, [Validators.required, Validators.min(0)]],
    base_consultation_price: [0, [Validators.required, Validators.min(0)]],
    signature_url: [''],
    is_telemedicine_enabled: [false],
    specialty_ids: [[] as number[]],
  });

  constructor() {
    effect(() => {
      const profile = this.store.currentProfile();
      if (profile) {
        this.profileForm.patchValue({
          license_number: profile.license_number,
          bio: profile.bio,
          experience_years: profile.experience_years,
          base_consultation_price: profile.base_consultation_price,
          signature_url: profile.signature_url,
          is_telemedicine_enabled: profile.is_telemedicine_enabled,
          specialty_ids: profile.specialties ? profile.specialties.map((s) => s.id) : [],
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadProfile();

    this.specialtiesService.list({ size: 100 }).subscribe({
      next: (res) => this.availableSpecialties.set(res.items),
      error: (err) => console.error('Fallo al recuperar el catálogo de especialidades', err),
    });
  }

  protected onSave(): void {
    if (this.profileForm.invalid) return;
    this.store.updateProfile(this.profileForm.getRawValue());
  }
}

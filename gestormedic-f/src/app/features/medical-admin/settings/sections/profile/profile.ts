import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AvatarModule } from 'primeng/avatar';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationService } from '@core/services/notification';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { UpdateProfilePayload, User } from '@core/models/auth.model';

@Component({
  selector: 'gm-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    InputTextModule, 
    TextareaModule, 
    AvatarModule, 
    RoundedButton,
    SelectModule,
    MultiSelectModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Profile {
  private fb = inject(FormBuilder);
  authStore = inject(AuthStore);
  private notification = inject(NotificationService);

  isEditing = signal(false);
  showPhotoPicker = signal(false);

  user = this.authStore.user;
  private readonly defaultWorkingDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

  availablePhotos = [
    '/profile/1.webp', 
    '/profile/2.webp', 
    '/profile/3.webp', 
    '/profile/4.webp'
  ];
  
  selectedPhoto = signal(this.user()?.photo_url || this.availablePhotos[0]);

  daysOptions = [
    { label: 'Lunes', value: 'Lun' },
    { label: 'Martes', value: 'Mar' },
    { label: 'Miércoles', value: 'Mié' },
    { label: 'Jueves', value: 'Jue' },
    { label: 'Viernes', value: 'Vie' },
    { label: 'Sábado', value: 'Sáb' },
    { label: 'Domingo', value: 'Dom' }
  ];

  profileForm = this.fb.nonNullable.group({
    first_name: [{ value: '', disabled: true }, [Validators.required]],
    last_name: [{ value: '', disabled: true }, [Validators.required]],
    username: [{ value: '', disabled: true }, [Validators.required]],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    specialty: [{ value: '', disabled: true }, [Validators.required]],
    license: [{ value: '', disabled: true }, [Validators.required]],
    phone: [{ value: '', disabled: true }, [Validators.required]],
    bio: [{ value: '', disabled: true }],
    clinic_name: [{ value: '', disabled: true }],
    address: [{ value: '', disabled: true }],
    // Redes Sociales
    instagram: [{ value: '', disabled: true }],
    twitter: [{ value: '', disabled: true }],
    facebook: [{ value: '', disabled: true }],
    // Horarios
    working_days: [{ value: [] as string[], disabled: true }],
    working_hours: [{ value: '09:00 - 18:00', disabled: true }]
  });

  constructor() {
    effect(() => {
      const data = this.user();
      if (data) {
        this.syncFormFromUser(data);
      }
    });
  }

  private syncFormFromUser(data: User) {
    this.profileForm.patchValue({
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      email: data.email,
      specialty: data.specialty,
      license: data.license,
      phone: data.phone,
      bio: data.bio,
      clinic_name: data.clinic_name,
      address: data.address,
      instagram: data.instagram,
      twitter: data.twitter,
      facebook: data.facebook,
      working_days: data.working_days?.length ? data.working_days : this.defaultWorkingDays,
      working_hours: data.working_hours,
    });
    this.selectedPhoto.set(data.photo_url || this.availablePhotos[0]);
  }

  toggleEdit() {
    this.isEditing.update(v => !v);
    if (this.isEditing()) {
      this.profileForm.enable();
    } else {
      const currentUser = this.user();
      if (currentUser) {
        this.syncFormFromUser(currentUser);
      }
      this.profileForm.disable();
      this.showPhotoPicker.set(false);
    }
  }

  selectPhoto(url: string) {
    this.selectedPhoto.set(url);
    this.showPhotoPicker.set(false);
  }

  saveChanges() {
    if (this.profileForm.invalid) {
      this.notification.builder().warn().summary('Formulario inválido').detail('Revise los campos obligatorios.').show();
      return;
    }

    const rawValue = this.profileForm.getRawValue();
    const payload: UpdateProfilePayload = {
      first_name: rawValue.first_name,
      last_name: rawValue.last_name,
      username: rawValue.username,
      specialty: rawValue.specialty,
      license: rawValue.license,
      phone: rawValue.phone,
      bio: rawValue.bio || '',
      clinic_name: rawValue.clinic_name || '',
      address: rawValue.address || '',
      instagram: rawValue.instagram || '',
      twitter: rawValue.twitter || '',
      facebook: rawValue.facebook || '',
      working_days: rawValue.working_days?.length ? rawValue.working_days : this.defaultWorkingDays,
      working_hours: rawValue.working_hours,
      photo_url: this.selectedPhoto(),
    };

    this.authStore.updateProfile(payload).subscribe({
      next: () => {
        this.notification.builder().success().summary('Perfil guardado').detail('Sus cambios se han sincronizado correctamente.').show();
        this.toggleEdit();
      },
      error: () => {
        this.notification.builder().error().summary('Error').detail('No se pudo actualizar el perfil.').show();
      },
    });
  }
}

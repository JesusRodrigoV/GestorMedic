import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationService } from '@core/services/notification';

@Component({
  selector: 'gm-profile',
  imports: [ReactiveFormsModule, InputTextModule, AvatarModule, RoundedButton],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Profile {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  private notification = inject(NotificationService);

  isEditing = signal(false);
  showPhotoPicker = signal(false);

  user = this.authStore.user;

  availablePhotos = ['profile/1.webp', 'profile/2.webp', 'profile/3.webp', 'profile/4.webp'];
  selectedPhoto = signal(this.user()?.photo_url || this.availablePhotos[0]);

  profileForm = this.fb.nonNullable.group({
    first_name: [{ value: '', disabled: true }, [Validators.required]],
    last_name: [{ value: '', disabled: true }, [Validators.required]],
    username: [{ value: '', disabled: true }, [Validators.required]],
  });

  constructor() {
    effect(() => {
      const data = this.user();
      if (data) {
        this.profileForm.patchValue({
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
        });
        this.selectedPhoto.set(data.photo_url || this.availablePhotos[0]);
      }
    });
  }

  toggleEdit() {
    this.isEditing.set(!this.isEditing());
    if (this.isEditing()) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.showPhotoPicker.set(false);
    }
  }

  selectPhoto(url: string) {
    this.selectedPhoto.set(url);
    this.showPhotoPicker.set(false);
  }

  async saveChanges() {
    if (this.profileForm.valid) {
      const payload = {
        ...this.profileForm.getRawValue(),
        photo_url: this.selectedPhoto(),
      };

      this.authStore.updateProfile(payload).subscribe({
        next: () => {
          this.notification.builder().success().summary('Perfil actualizado correctamente.').show();
          this.toggleEdit();
        },
        error: () => {
          this.notification.builder().error().summary('Error al sincronizar con la red.').show();
        },
      });
    }
  }
}

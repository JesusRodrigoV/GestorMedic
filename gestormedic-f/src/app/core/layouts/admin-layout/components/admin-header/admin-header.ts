import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationButton } from '@shared/components/notification-button';

@Component({
  selector: 'gm-admin-header',
  imports: [Avatar, TooltipModule, RoundedButton, NotificationButton],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-admin-header-host',
  },
})
export class AdminHeader {
  authStore = inject(AuthStore);
  notification = inject(NotificationService);

  user = this.authStore.user;
  onToggleSidebar = output<void>();

  availablePhotos = ['profile/1.webp', 'profile/2.webp', 'profile/3.webp', 'profile/4.webp'];
  selectedPhoto = signal(this.user()?.photo_url || this.availablePhotos[0]);

  isLoggedIn = this.authStore.isAuthenticated;

  tenantName = computed(() => {
    const data = this.user();
    if (data?.is_admin) return 'Centro de Control Maestro';
    return data ? 'Clínica Central Médica' : 'Cargando Jurisdicción...';
  });

  userDisplayName = computed(() => {
    const data = this.user();
    return data ? `${data.first_name} ${data.last_name}` : 'Profesional';
  });

  userRoleName = computed(() => {
    const roleId = this.user()?.role_id;
    switch (roleId) {
      case 1:
        return 'Administrador de Centro';
      case 2:
        return 'Médico Especialista';
      default:
        return 'Personal Autorizado';
    }
  });

  avatarUrl = computed(
    () =>
      this.user()?.photo_url ||
      'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
  );

  onNewAction(): void {
    this.notification.builder().info('Iniciando registro de nueva actividad clínica.').show();
  }

  onLogout(): void {
    this.authStore.logout();
  }
}

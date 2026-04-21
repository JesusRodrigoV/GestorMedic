import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { OverlayBadge } from 'primeng/overlaybadge';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button';
import { UserRole } from '@core/models/role.model';

@Component({
  selector: 'gm-header',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, Avatar, OverlayBadge, RoundedButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-header-host',
  },
})
export class Header {
  authStore = inject(AuthStore);
  notification = inject(NotificationService);

  user = this.authStore.user;
  isLoggedIn = this.authStore.isAuthenticated;
  isLoading = this.authStore.isLoading;

  isPro = computed(() => this.user()?.is_admin ?? false);

  userName = computed(() => {
    const data = this.user();
    return data ? `${data.first_name} ${data.last_name}` : 'Invitado';
  });

  userRoleName = computed(() => {
    const roleId = this.user()?.role_id;

    switch (roleId) {
      case UserRole.SUPERADMIN:
        return 'Super Admin';
      case UserRole.ADMIN_CLINICA:
        return 'Administrador';
      case UserRole.MEDICO:
        return 'Médico Especialista';
      case UserRole.RECEPCIONISTA:
        return 'Recepción';
      case UserRole.PACIENTE:
        return 'Paciente';
      case UserRole.ASEGURADORA:
        return 'Aseguradora';
      default:
        return 'Usuario';
    }
  });

  dashboardRoute = computed(() => {
    const data = this.user();
    if (!data) return '/';

    if (data.is_admin || data.role_id === UserRole.SUPERADMIN) {
      return '/control/';
    } else if (
      data.role_id === UserRole.ADMIN_CLINICA ||
      data.role_id === UserRole.MEDICO ||
      data.role_id === UserRole.RECEPCIONISTA
    ) {
      return '/app/';
    }
    return '/portal/';
  });

  userAvatar = computed(() => this.user()?.photo_url || 'profile/1.webp');

  unreadNotifications = signal(3);

  navLinks = signal([
    { label: 'Inicio', route: '/home' },
    { label: 'Especialidades', route: '/especialidades' },
    { label: 'Directorio', route: '/directorio' },
    { label: 'Videollamada', route: '/videollamada' },
    { label: 'Recetas', route: '/recetas' },
    { label: 'Nosotros', route: '/nosotros' },
  ]);

  onLogout(): void {
    this.authStore.logout();
    this.notification.builder().warn().summary('Sesión finalizada.').show();
  }

  onShowNotifications(): void {
    this.notification
      .builder()
      .info('Revisando alertas de agenda y resultados clínicos.')
      .summary('Notificaciones')
      .show();
  }
}

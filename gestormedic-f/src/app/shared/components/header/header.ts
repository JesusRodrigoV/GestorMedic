import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { OverlayBadge } from 'primeng/overlaybadge';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { UserRole } from '@core/models/role.model';

@Component({
  selector: 'gm-header',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, Avatar, OverlayBadge, RoundedButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly authStore = inject(AuthStore);
  private readonly notification = inject(NotificationService);

  readonly user = this.authStore.user;
  readonly isLoggedIn = this.authStore.isAuthenticated;
  readonly isLoading = this.authStore.isLoading;

  readonly isPro = computed(() => this.user()?.is_admin ?? false);

  readonly userName = computed(() => {
    const data = this.user();
    if (!data) return 'Invitado';
    return data.first_name && data.last_name 
      ? `${data.first_name} ${data.last_name}` 
      : data.username;
  });

  readonly userRoleName = computed(() => {
    const roleId = this.user()?.role_id;
    const roles: Record<number, string> = {
      [UserRole.SUPERADMIN]: 'Super Admin',
      [UserRole.ADMIN_CLINICA]: 'Administrador',
      [UserRole.MEDICO]: 'Médico Especialista',
      [UserRole.RECEPCIONISTA]: 'Recepción',
      [UserRole.PACIENTE]: 'Paciente',
      [UserRole.ASEGURADORA]: 'Aseguradora'
    };
    return roles[roleId ?? 0] || 'Usuario';
  });

  readonly dashboardRoute = computed(() => {
    const data = this.user();
    if (!data) return '/';

    const role = data.role_id;
    if (data.is_admin || role === UserRole.SUPERADMIN) return '/control/';
    
    const isStaff = [
      UserRole.ADMIN_CLINICA, 
      UserRole.MEDICO, 
      UserRole.RECEPCIONISTA
    ].includes(role ?? 0);

    return isStaff ? '/app/' : '/portal/';
  });

  readonly userAvatar = computed(() => this.user()?.photo_url || 'profile/1.webp');

  readonly unreadNotifications = signal(0);

  readonly navLinks = signal([
    { label: 'Inicio', route: '/home' },
    { label: 'Especialidades', route: '/especialidades' },
    { label: 'Directorio', route: '/directorio' },
    { label: 'Nosotros', route: '/nosotros' },
  ]);

  onLogout(): void {
    this.authStore.logout();
    this.notification.builder().warn().summary('Sesión finalizada').show();
  }

  onShowNotifications(): void {
    this.notification
      .builder()
      .info('Sincronizando alertas de agenda y registros médicos.')
      .summary('Notificaciones')
      .show();
  }
}
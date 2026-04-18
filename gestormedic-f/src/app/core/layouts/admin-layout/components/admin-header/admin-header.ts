import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationButton } from '@shared/components/notification-button';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRole } from '@core/models/role.model';

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
  route = inject(ActivatedRoute);
  authStore = inject(AuthStore);
  notification = inject(NotificationService);
  router = inject(Router);

  user = this.authStore.user;
  onToggleSidebar = output<void>();

  isLoggedIn = this.authStore.isAuthenticated;

  tenantName = computed(() => {
    const data = this.user();
    if (!data) return 'Cargando...';

    switch (data.role_id) {
      case UserRole.SUPERADMIN:
        return 'Centro de Control Maestro';
      case UserRole.ADMIN_CLINICA:
        return 'Administración de Clínica';
      case UserRole.MEDICO:
        return 'Consultorio Médico';
      case UserRole.PACIENTE:
        return 'Portal del Paciente';
      default:
        return 'GestorMedic';
    }
  });

  userDisplayName = computed(() => {
    const data = this.user();
    return data ? `${data.first_name} ${data.last_name}` : 'Usuario';
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

  userAvatar = computed(() => this.user()?.photo_url || 'profile/1.webp');

  onNewAction(): void {
    this.notification.builder().info('Iniciando registro de nueva actividad clínica.').show();
  }

  goToProfile(): void {
    const currentUrl = this.router.url;
    const urlSegments = currentUrl.split('/');
    const baseSegment = urlSegments[1];

    this.router.navigate([`/${baseSegment}/settings/profile`]);
  }

  onLogout(event: Event): void {
    event.stopPropagation();
    this.authStore.logout();
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { OverlayBadge } from 'primeng/overlaybadge';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button';

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

  isPro = computed(() => this.user()?.is_admin ?? false);
  userName = computed(() => {
    const data = this.user();
    return data ? `${data.first_name} ${data.last_name}` : 'Invitado';
  });

  userAvatar = computed(
    () =>
      this.user()?.photo_url ||
      'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
  );
  unreadNotifications = signal(3);

  navLinks = signal([
    { label: 'Inicio', route: '/home' },
    { label: 'Médicos', route: '/search' },
    { label: 'Planes', route: '/public/plans' },
    { label: 'app', route: '/app' },
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

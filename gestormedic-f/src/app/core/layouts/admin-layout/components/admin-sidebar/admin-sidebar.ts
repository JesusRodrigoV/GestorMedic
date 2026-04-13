import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AuthStore } from '@features/auth/stores/auth.store';

@Component({
  selector: 'gm-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TooltipModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebar {
  private authStore = inject(AuthStore);
  user = this.authStore.user;

  private doctorMenuItems = [
    { label: 'Panel de Control', icon: 'pi-home', route: '/app/dashboard', exact: true },
    { label: 'Agenda Médica', icon: 'pi-calendar', route: '/app/appointments', exact: true },
    { label: 'Pacientes', icon: 'pi-users', route: '/app/patients', exact: true },
    { label: 'Historial Clínico', icon: 'pi-file-edit', route: '/app/medical-records', exact: true },
    { label: 'Módulo Financiero', icon: 'pi-wallet', route: '/app/finance', exact: true },
    { label: 'Configuración', icon: 'pi-cog', route: '/app/settings', exact: false }
  ];

  private patientMenuItems = [
    { label: 'Mis Citas', icon: 'pi-calendar', route: '/portal/appointments', exact: true },
    { label: 'Reservar Cita', icon: 'pi-plus-circle', route: '/portal/book', exact: true },
    { label: 'Mi Historial', icon: 'pi-file', route: '/portal/medical-history', exact: true },
  ];

  menuItems = computed(() =>
    this.user()?.role_id === 3 ? this.patientMenuItems : this.doctorMenuItems,
  );

  userRoleLabel = computed(() => (this.user()?.role_id === 3 ? 'Paciente' : 'Médico'));

  onLogout() {
    this.authStore.logout();
  }
}

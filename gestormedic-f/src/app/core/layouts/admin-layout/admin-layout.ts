import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AdminHeader } from './components/admin-header';
import { Sidebar } from '@shared/components/sidebar';
import { MenuItem } from '@shared/models/menu-item';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-admin-layout',
  imports: [AdminHeader, Sidebar, RouterOutlet, Toast],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayout {
  isSidebarCollapsed = signal(false);
  menuItems = signal<MenuItem[]>([
    { label: 'Panel de Control', icon: 'bx-grid-alt', route: '/app/dashboard' },
    { label: 'Gestión de Pacientes', icon: 'bxs-user-detail', route: '/app/patients' },
    { label: 'Agenda y Citas', icon: 'bx-calendar-event', route: '/app/appointments' },
    { label: 'Historiales Clínicos', icon: 'bx-folder-open', route: '/app/medical-records' },
    { label: 'Módulo Financiero', icon: 'bx-wallet', route: '/app/finance' },
    { label: 'Configuración', icon: 'bx-cog', route: '/app/settings' },
  ]);

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((state) => !state);
  }
}

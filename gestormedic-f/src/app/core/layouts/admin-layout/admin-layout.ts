import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { AdminHeader } from './components/admin-header/admin-header';
import { AdminSidebar } from './components/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [AdminHeader, AdminSidebar, RouterOutlet, Toast],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayout {
  isSidebarCollapsed = signal(false);

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((state) => !state);
  }
}

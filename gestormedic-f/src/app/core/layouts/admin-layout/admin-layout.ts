import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AdminHeader } from './components/admin-header';
import { Sidebar } from '@shared/components/sidebar';
import { MenuItem } from '@shared/models/menu-item';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthStore } from '@features/auth/stores/auth.store';

@Component({
  selector: 'app-admin-layout',
  imports: [AdminHeader, Sidebar, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayout {
  private route = inject(ActivatedRoute);
  private authStore = inject(AuthStore);

  isSidebarCollapsed = signal(false);
  menuItems = signal<MenuItem[]>(
    (this.route.snapshot.data['menu'] || []).filter((item: MenuItem) => {
      if (!item.roleIds || !item.roleIds.length) {
        return true;
      }
      const roleId = this.authStore.currentUser()?.role_id;
      return !!roleId && item.roleIds.includes(roleId);
    }),
  );

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((state) => !state);
  }
}

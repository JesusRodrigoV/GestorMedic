import { ChangeDetectionStrategy, Component, inject, signal, Injector, runInInjectionContext } from '@angular/core';
import { AdminHeader } from './components/admin-header';
import { Sidebar } from '@shared/components/sidebar';
import { MenuItem } from '@shared/models/menu-item';
import { ActivatedRoute, Router, NavigationEnd, RouterOutlet } from '@angular/router';
import * as AuthStoreModule from '@features/auth/stores/auth.store';

@Component({
  selector: 'app-admin-layout',
  imports: [AdminHeader, Sidebar, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayout {
  private route = inject(ActivatedRoute);
  private authStore = inject(AuthStoreModule.AuthStore);

  isSidebarCollapsed = signal(false);
  menuItems = signal<MenuItem[]>(this.findMenuItems());

  private router = inject(Router);
  private injector = inject(Injector);

  // initialize reactive watcher for route changes
  private _init = (() => {
    try {
      // set initial menu
      this.menuItems.set(this.findMenuItems());
      // update on navigation end
      this.router.events.subscribe((ev: any) => {
        if (ev instanceof NavigationEnd) {
          const items = this.findMenuItems();
          console.debug('AdminLayout: updating menu after navigation', items);
          this.menuItems.set(items);
        }
      });
    } catch (_e) {
      // ignore
    }
    return true;
  })();

  private findMenuItems(): MenuItem[] {
    try {
      const snapshots: any[] = (this.route.snapshot as any).pathFromRoot || [];
      const user = this.authStore.currentUser();
      for (const sn of snapshots) {
        if (sn && sn.data && sn.data['menu']) {
          const rawMenu = sn.data['menu'];
          const menu = typeof rawMenu === 'function'
            ? (rawMenu as Function)(user) as MenuItem[]
            : (rawMenu as MenuItem[]);
          return this.ensureRanking(menu);
        }
      }
    } catch (_e) {
      // ignore
    }
    const rawFallback = this.route.snapshot.data['menu'] || [];
    const fallback = typeof rawFallback === 'function'
      ? (rawFallback as Function)(this.authStore.currentUser()) as MenuItem[]
      : (rawFallback as MenuItem[]);
    return this.ensureRanking(fallback);
  }

  private ensureRanking(items: MenuItem[]): MenuItem[] {
    try {
      const url = (this.router && this.router.url) || (typeof window !== 'undefined' ? window.location.pathname : '');
      const base = url.split('/')?.[1] || '';
      let rankingRoute = '';
      if (base === 'portal') rankingRoute = '/portal/ranking';
      else if (base === 'app') rankingRoute = '/app/ranking';

      if (rankingRoute) {
        const exists = items.some(i => i.route === rankingRoute || (i.label && i.label.toLowerCase() === 'ranking'));
        if (!exists) {
          return [...items, { label: 'Ranking', icon: 'bx-heart', route: rankingRoute }];
        }
      }
    } catch (_e) {
      // ignore
    }
    return items;
  }

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((state) => !state);
  }
}

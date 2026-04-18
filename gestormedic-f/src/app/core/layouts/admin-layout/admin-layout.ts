import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AdminHeader } from './components/admin-header';
import { Sidebar } from '@shared/components/sidebar';
import { MenuItem } from '@shared/models/menu-item';
import { ActivatedRoute, Router, NavigationEnd, RouterOutlet } from '@angular/router';

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
  menuItems = signal<MenuItem[]>(this.findMenuItems());

  private router = inject(Router);

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
      // Debug: log snapshots to help find where the menu data is attached
      console.debug('AdminLayout: route snapshots for menu discovery', snapshots.map(s => ({ path: s.routeConfig?.path, data: s.data })));
      for (const sn of snapshots) {
        if (sn && sn.data && sn.data['menu']) {
          const menu = sn.data['menu'] as MenuItem[];
          console.debug('AdminLayout: found menu in snapshot', sn.routeConfig?.path, menu);
          return this.ensureRanking(menu);
        }
      }
    } catch (_e) {
      // ignore
    }
    const fallback = (this.route.snapshot.data['menu'] || []) as MenuItem[];
    console.debug('AdminLayout: fallback menu', fallback);
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

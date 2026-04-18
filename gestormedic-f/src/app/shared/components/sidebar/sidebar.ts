import { ChangeDetectionStrategy, Component, computed, input, output, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { MenuItem } from '@shared/models/menu-item';
import { TooltipModule } from 'primeng/tooltip';
import { RoundedButton } from '@shared/ui/rounded-button';

@Component({
  selector: 'gm-sidebar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, TooltipModule, RoundedButton],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.gm-sidebar--collapsed]': 'isCollapsed()',
    class: 'gm-sidebar-host',
  },
})
export class Sidebar {
  isCollapsed = input<boolean>(false);
  readonly items = input<MenuItem[]>([]);

  onItemClick = output<void>();

  showLogoText = computed(() => !this.isCollapsed());

  private router = inject(Router);

  displayedItems = computed(() => {
    const base = (this.router && this.router.url) ? this.router.url.split('/')?.[1] : (typeof window !== 'undefined' ? window.location.pathname.split('/')?.[1] : '');
    let rankingRoute = '';
    if (base === 'portal') rankingRoute = '/portal/ranking';
    else if (base === 'app') rankingRoute = '/app/ranking';
    const items = this.items() || [];
    if (rankingRoute) {
      const exists = items.some(i => i.route === rankingRoute || (i.label && i.label.toLowerCase() === 'ranking'));
      if (!exists) {
        return [...items, { label: 'Ranking', icon: 'bx-heart', route: rankingRoute }];
      }
    }
    return items;
  });

  private _log = computed(() => {
    const it = this.displayedItems();
    console.debug('Sidebar: displayed items', it);
    return it;
  });
}

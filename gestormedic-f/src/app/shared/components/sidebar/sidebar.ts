import { ChangeDetectionStrategy, Component, computed, input, output, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MenuItem } from '@shared/models/menu-item';
import { TooltipModule } from 'primeng/tooltip';
import { RoundedButton } from '@shared/ui/rounded-button';

@Component({
  selector: 'gm-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, NgOptimizedImage, TooltipModule, RoundedButton],
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

  // Tracks which menus are expanded
  readonly expandedItems = signal<Record<string, boolean>>({});

  toggleSubmenu(label: string, event: Event): void {
    event.stopPropagation();
    this.expandedItems.update(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  }

  isExpanded(label: string): boolean {
    return !!this.expandedItems()[label];
  }

  displayedItems = computed(() => {
    const base = (this.router && this.router.url) ? this.router.url.split('/')?.[1] : (typeof window !== 'undefined' ? window.location.pathname.split('/')?.[1] : '');
    let rankingRoute = '';
    if (base === 'portal') rankingRoute = '/portal/ranking';
    else if (base === 'app') rankingRoute = '/app/ranking';
    const items = this.items() || [];
    
    let result = [...items];
    if (rankingRoute) {
      const exists = result.some(i => i.route === rankingRoute || (i.label && i.label.toLowerCase() === 'ranking'));
      if (!exists) {
        result.push({ label: 'Ranking', icon: 'bx-heart', route: rankingRoute });
      }
    }
    return result;
  });
}

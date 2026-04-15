import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
}

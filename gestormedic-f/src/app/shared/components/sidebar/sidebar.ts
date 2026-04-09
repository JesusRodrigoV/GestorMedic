import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
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
  readonly isCollapsed = input<boolean>(false);
  readonly items = input<MenuItem[]>([]);

  protected readonly showLogoText = computed(() => !this.isCollapsed());
}

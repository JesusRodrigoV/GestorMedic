import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '@core/models/auth.model';
import { NotificationService } from '@core/services/notification';
import { UsersAdminService } from '@core/services/users-admin';
import { MainContainer } from '@core/layouts/main-container';
import { TableModule } from 'primeng/table';
import { RoundedButton } from '@shared/ui/rounded-button';
import { ROLE_DICTIONARY } from '@core/models/role.model';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'gm-users-manager',
  imports: [FormsModule, DatePipe, MainContainer, TableModule, RoundedButton, InputTextModule],
  templateUrl: './users-manager.html',
  styleUrl: './users-manager.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsersManager {
  private usersAdmin = inject(UsersAdminService);
  private notification = inject(NotificationService);

  roleDictionary = ROLE_DICTIONARY;

  rows = signal<User[]>([]);
  page = signal(1);
  pageSize = signal(10);
  total = signal(0);
  sortBy = signal('created_at');
  sortType = signal<'asc' | 'desc'>('desc');
  filter = signal('');

  constructor() {
    this.load();
  }

  onFilterChange(value: string): void {
    this.filter.set(value);
    this.page.set(1);
    this.load();
  }

  onSortChange(field: string): void {
    if (this.sortBy() === field) {
      this.sortType.set(this.sortType() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortType.set('asc');
    }
    this.load();
  }

  nextPage(): void {
    const next = this.page() + 1;
    const maxPage = Math.max(1, Math.ceil(this.total() / this.pageSize()));
    if (next <= maxPage) {
      this.page.set(next);
      this.load();
    }
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.load();
    }
  }

  private load(): void {
    this.usersAdmin
      .listUsers({
        page: this.page(),
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortType: this.sortType(),
        filter: this.filter().trim() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.rows.set(response.items);
          this.total.set(response.metadata.total);
        },
        error: () => {
          this.notification
            .builder()
            .error()
            .summary('No se pudo cargar usuarios')
            .detail('Verifica permisos o disponibilidad del backend.')
            .show();
        },
      });
  }
}

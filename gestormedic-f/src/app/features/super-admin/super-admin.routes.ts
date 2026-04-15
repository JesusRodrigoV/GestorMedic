import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role-guard';
import { UserRole } from '@core/models/role.model';

export const SUPER_ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../core/layouts/admin-layout/admin-layout'),
    canActivate: [roleGuard],
    data: {
      allowedRoles: [UserRole.SUPERADMIN],
    },
    children: [
      {
        path: 'management',
        loadComponent: () => import('./management/management'),
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
    ],
  },
];

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
      menu: [
        { label: 'Gestión de Inquilinos', icon: 'bx-buildings', route: '/control/clinics' },
        { label: 'Gestión de usuarios', icon: 'bx-buildings', route: '/control/users' },
        { label: 'Catálogo de Especialidades', icon: 'bx-list-ul', route: '/control/specialties' },
        { label: 'Planes de Suscripción', icon: 'bx-credit-card-front', route: '/control/plans' },
        { label: 'Economía del Sistema', icon: 'bx-line-chart', route: '/control/economy' },
        { label: 'Estado de Suscripciones', icon: 'bx-pie-chart-alt-2', route: '/control/subscriptions' },
        { label: 'Auditoría y Seguridad', icon: 'bx-shield-quarter', route: '/control/audit' },
        { label: 'Configuración del Sistema', icon: 'bx-cog', route: '/control/settings' },
      ],
    },
    children: [
      {
        path: '',
        redirectTo: 'clinics',
        pathMatch: 'full',
      },
      {
        path: 'clinics',
        loadComponent: () => import('./clinics-manager/clinics-manager'),
      },
      {
        path: 'users',
        loadComponent: () => import('./users-manager/users-manager'),
      },
      {
        path: 'specialties',
        loadComponent: () => import('./specialties-manager/specialties-manager'),
      },
      {
        path: 'plans',
        loadComponent: () => import('./subscription-plans/subscription-plans'),
      },
      {
        path: 'economy',
        loadComponent: () => import('./economy-dashboard/economy-dashboard'),
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./subscriptions-overview/subscriptions-overview'),
      },
      {
        path: 'audit',
        loadComponent: () => import('./audit-manager/audit-manager'),
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
    ],
  },
];

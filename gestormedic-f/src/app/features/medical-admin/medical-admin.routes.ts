import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role-guard';
import { pendingChangesGuard } from '@core/guards/pending-changes.guard';
import { UserRole } from '@core/models/role.model';

export const MEDICAL_ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../core/layouts/admin-layout/admin-layout'),
    canActivate: [roleGuard],
    data: {
      allowedRoles: [UserRole.MEDICO, UserRole.ADMIN_CLINICA],
      menu: [
        { label: 'Panel de Control', icon: 'bx-grid-alt', route: '/app/dashboard' },
        {
          label: 'Agenda Semanal',
          icon: 'bx-calendar-edit',
          route: '/app/agenda-semanal',
          roleIds: [UserRole.MEDICO],
        },
        {
          label: 'Calendario',
          icon: 'bx-calendar-alt',
          route: '/app/calendario',
          roleIds: [UserRole.MEDICO],
        },
        { label: 'Citas', icon: 'bx-calendar-event', route: '/app/citas', roleIds: [UserRole.MEDICO] },
        {
          label: 'Consultorios',
          icon: 'bx-building-house',
          route: '/app/consultorios',
          roleIds: [UserRole.ADMIN_CLINICA],
        },
        { label: 'Gestión de Pacientes', icon: 'bxs-user-detail', route: '/app/patients' },
        {
          label: 'Historiales',
          icon: 'bx-notepad',
          route: '/app/historiales',
          roleIds: [UserRole.MEDICO],
        },
        {
          label: 'Historiales Editables',
          icon: 'bx-time-five',
          route: '/app/historiales/editables',
          roleIds: [UserRole.MEDICO],
        },
        { label: 'Configuración', icon: 'bx-cog', route: '/app/settings' },
      ],
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard'),
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'agenda-semanal',
        loadComponent: () => import('./weekly-agenda/weekly-agenda'),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'calendario',
        loadComponent: () => import('./agenda-calendar/agenda-calendar'),
      },
      {
        path: 'citas',
        loadComponent: () => import('./appointments/appointments'),
      },
      {
        path: 'consultorios',
        loadComponent: () => import('./consulting-rooms/consulting-rooms'),
        canActivate: [roleGuard],
        data: {
          allowedRoles: [UserRole.ADMIN_CLINICA],
        },
      },
      {
        path: 'patients',
        loadComponent: () => import('./patient-list/patient-list'),
      },
      {
        path: 'historiales',
        loadComponent: () => import('./medical-histories/medical-histories'),
        canActivate: [roleGuard],
        data: {
          allowedRoles: [UserRole.MEDICO],
        },
      },
      {
        path: 'historiales/editables',
        loadComponent: () => import('./medical-histories/medical-histories'),
        canActivate: [roleGuard],
        data: {
          allowedRoles: [UserRole.MEDICO],
        },
      },
    ],
  },
];

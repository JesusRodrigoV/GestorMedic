import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role-guard';
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
        { label: 'Gestión de Pacientes', icon: 'bxs-user-detail', route: '/app/patients' },
        { label: 'Agenda y Citas', icon: 'bx-calendar-event', route: '/app/appointments' },
        { label: 'Historiales Clínicos', icon: 'bx-folder-open', route: '/app/medical-records' },
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
        path: 'patients',
        loadComponent: () => import('./patient-list/patient-list'),
      },
    ],
  },
];

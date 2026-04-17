import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role-guard';
import { UserRole } from '@core/models/role.model';
import { AuthStore } from '@features/auth/stores/auth.store';

const getDynamicMenu = () => {
  const authStore = inject(AuthStore);
  const user = authStore.currentUser();
  
  if (!user) return [];

  const baseMenu = [
    { label: 'Panel de Control', icon: 'bx-grid-alt', route: '/app/dashboard' },
    { label: 'Agenda y Citas', icon: 'bx-calendar-event', route: '/app/appointments' },
    { label: 'Pacientes', icon: 'bxs-user-detail', route: '/app/patients' },
  ];

  // Si es administrador (o médico independiente que también es admin)
  if (user.role_id === UserRole.ADMIN_CLINICA) {
    baseMenu.push(
      { label: 'Gestión de Clínica', icon: 'bx-buildings', route: '/app/management' }
    );
  }

  baseMenu.push({ label: 'Configuración Personal', icon: 'bx-cog', route: '/app/settings' });

  return baseMenu;
};

export const CLINIC_WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../core/layouts/admin-layout/admin-layout'),
    canActivate: [roleGuard],
    data: {
      allowedRoles: [UserRole.MEDICO, UserRole.ADMIN_CLINICA, UserRole.RECEPCIONISTA],
    },
    resolve: {
      menu: () => getDynamicMenu()
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard'),
      },
      {
        path: 'patients',
        loadComponent: () => import('./patient-list/patient-list'),
      },
      {
        path: 'management',
        canActivate: [roleGuard],
        data: { allowedRoles: [UserRole.ADMIN_CLINICA] },
        loadComponent: () => import('./management/clinic-management/clinic-management'),
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      }
    ],
  },
];
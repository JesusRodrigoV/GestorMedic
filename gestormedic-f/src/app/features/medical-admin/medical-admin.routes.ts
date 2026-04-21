import { Routes } from '@angular/router';
import { pendingChangesGuard } from '@core/guards/pending-changes.guard';
import { roleGuard } from '@core/guards/role-guard';
import { UserRole } from '@core/models/role.model';

const getDynamicMenu = (user: any) => {
  if (!user) return [];

  const baseMenu = [
    { label: 'Panel de Control', icon: 'bx-grid-alt', route: '/app/dashboard' },
    { label: 'Gestión de Pacientes', icon: 'bxs-user-detail', route: '/app/patients' },
  ];

  if ([UserRole.MEDICO, UserRole.ADMIN_CLINICA, UserRole.RECEPCIONISTA].includes(user.role_id)) {
    baseMenu.push(
      { label: 'Agenda Semanal', icon: 'bx-calendar-edit', route: '/app/agenda-semanal' },
      { label: 'Calendario', icon: 'bx-calendar-alt', route: '/app/calendario' },
      { label: 'Citas', icon: 'bx-calendar-event', route: '/app/citas' },
      { label: 'Solicitudes Social', icon: 'bx-user-plus', route: '/app/social-inbox' }
    );
  }

  // Rutas exclusivas del médico
  if (user.role_id === UserRole.MEDICO) {
    baseMenu.push(
      { label: 'Historiales', icon: 'bx-notepad', route: '/app/historiales' },
      { label: 'Historiales Editables', icon: 'bx-time-five', route: '/app/historiales/editables' }
    );
  }

  if (user.role_id === UserRole.ADMIN_CLINICA) {
    baseMenu.push(
      { label: 'Consultorios', icon: 'bx-building-house', route: '/app/consultorios' },
      { label: 'Gestión de Clínica', icon: 'bx-buildings', route: '/app/management' },
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
      allowedRoles: [UserRole.MEDICO, UserRole.ADMIN_CLINICA],
      menu: getDynamicMenu,
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard'),
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
        data: { allowedRoles: [UserRole.ADMIN_CLINICA] },
      },
      {
        path: 'patients',
        loadComponent: () => import('./patient-list/patient-list'),
      },
      {
        path: 'historiales',
        loadComponent: () => import('./medical-histories/medical-histories'),
        canActivate: [roleGuard],
        data: { allowedRoles: [UserRole.MEDICO] },
      },
      {
        path: 'historiales/editables',
        loadComponent: () => import('./medical-histories/medical-histories'),
        canActivate: [roleGuard],
        data: { allowedRoles: [UserRole.MEDICO] },
      },
      {
        path: 'management',
        canActivate: [roleGuard],
        data: { allowedRoles: [UserRole.ADMIN_CLINICA] },
        loadComponent: () => import('./management/clinic-management/clinic-management'),
      },
      {
        path: 'ranking',
        loadComponent: () => import('../public/ranking').then((m) => m.default),
      },
      {
        path: 'social-inbox',
        loadComponent: () => import('./social-inbox/social-inbox').then((m) => m.default),
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
    ],
  },
];
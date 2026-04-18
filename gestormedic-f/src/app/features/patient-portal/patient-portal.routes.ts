import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role-guard';
import { UserRole } from '@core/models/role.model';

export const PATIENT_PORTAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../core/layouts/admin-layout/admin-layout'),
    canActivate: [roleGuard],
    data: {
      allowedRoles: [UserRole.PACIENTE],
      menu: [
        { label: 'Mi Resumen', icon: 'bx-pulse', route: '/portal/resumen' },
        { label: 'Mis Citas', icon: 'bx-calendar', route: '/portal/citas' },
        { label: 'Ranking', icon: 'bx-heart', route: '/portal/ranking' },
        { label: 'Mi Historial', icon: 'bx-book-heart', route: '/portal/historial' },
        { label: 'Documentos', icon: 'bx-file', route: '/portal/documentos' },
        { label: 'Recetas', icon: 'bx-capsule', route: '/portal/recetas' },
        { label: 'Configuración', icon: 'bx-cog', route: '/portal/settings' },
      ],
    },
    children: [
      {
        path: '',
        redirectTo: 'resumen',
        pathMatch: 'full',
      },
      {
        path: 'resumen',
        loadComponent: () => import('./dashboard/dashboard'),
      },
      {
        path: 'citas',
        redirectTo: 'citas/agendar',
        pathMatch: 'full',
      },
      {
        path: 'citas/agendar',
        loadComponent: () => import('./appointment-booking/appointment-booking'),
      },
      {
        path: 'citas/historial',
        loadComponent: () => import('./appointment-history/appointment-history'),
      },
      {
        path: 'ranking',
        loadComponent: () => import('../public/ranking').then((m) => m.default),
      },
      {
        path: 'historial',
        loadComponent: () => import('./medical-history/medical-history'),
      },
      {
        path: 'documentos',
        loadComponent: () => import('./document-center/document-center'),
      },
      {
        path: 'recetas',
        loadComponent: () => import('./prescriptions/prescriptions'),
      },
      {
        path: 'facturacion',
        loadComponent: () => import('./billing/billing'),
      },
      {
        path: 'aseguradoras',
        loadComponent: () => import('./insurance/insurance'),
      },
      {
        path: 'recordatorios',
        loadComponent: () => import('./reminders/reminders'),
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
    ],
  },
];

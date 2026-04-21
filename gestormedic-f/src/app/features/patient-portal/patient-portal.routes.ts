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
        { label: 'Citas - Agendar', icon: 'bx-calendar-plus', route: '/portal/citas/agendar' },
        { label: 'Citas - Historial', icon: 'bx-calendar-check', route: '/portal/citas/historial' },
        { label: 'Mi Historial', icon: 'bx-book-heart', route: '/portal/historial' },
        { label: 'Archivos', icon: 'bx-folder-open', route: '/portal/documentos' },
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
        children: [
          {
            path: '',
            redirectTo: 'agendar',
            pathMatch: 'full',
          },
          {
            path: 'agendar',
            loadComponent: () => import('./appointment-booking/appointment-booking'),
          },
          {
            path: 'historial',
            loadComponent: () => import('./appointment-history/appointment-history'),
          },
        ],
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

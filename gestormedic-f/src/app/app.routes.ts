import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layouts/public-layout/public-layout'),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/public/home/home'),
      },
      {
        path: 'especialidades',
        loadComponent: () => import('./features/public/sections-page/sections-page'),
        data: { page: 'especialidades' },
      },
      {
        path: 'directorio',
        loadComponent: () => import('./features/public/sections-page/sections-page'),
        data: { page: 'directorio' },
      },
      {
        path: 'videollamada',
        loadComponent: () => import('./features/public/sections-page/sections-page'),
        data: { page: 'videollamada' },
      },
      {
        path: 'recetas',
        loadComponent: () => import('./features/public/sections-page/sections-page'),
        data: { page: 'recetas' },
      },
      {
        path: 'nosotros',
        loadComponent: () => import('./features/public/sections-page/sections-page'),
        data: { page: 'nosotros' },
      },
      {
        path: 'acceso',
        loadComponent: () => import('./features/public/sections-page/sections-page'),
        data: { page: 'acceso' },
      },
      {
        path: 'search',
        loadComponent: () => import('./features/public/search/search'),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () => import('./core/layouts/auth-layout/auth-layout'),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login'),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password'),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register'),
      },
      {
        path: 'register/clinic',
        loadComponent: () => import('./features/auth/register-clinic/register-clinic'),
      },

      {
        path: 'register/patient',
        loadComponent: () => import('./features/auth/register-patient/register-patient'),
      },
      {
        path: 'register/doctor',
        loadComponent: () => import('./features/auth/register-doctor/register-doctor'),
      },
    ],
  },
  {
    path: 'app',
    loadComponent: () => import('./core/layouts/admin-layout/admin-layout'),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/medical-admin/dashboard/dashboard'),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/medical-admin/settings/settings'),
        children: [
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          {
            path: 'profile',
            loadComponent: () =>
              import('./features/medical-admin/settings/sections/profile/profile'),
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('./features/medical-admin/settings/sections/notifications/notifications'),
          },
          {
            path: 'appearance',
            loadComponent: () =>
              import('./features/medical-admin/settings/sections/appearance/appearance'),
          },
        ],
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./features/medical-admin/patient-list/patient-list'),
      },
    ],
  },
  {
    path: 'portal',
    loadComponent: () => import('./core/layouts/patient-portal-layout/patient-portal-layout'),
    children: [
      {
        path: '',
        redirectTo: 'resumen',
        pathMatch: 'full',
      },
      {
        path: 'resumen',
        loadComponent: () => import('./features/patient-portal/dashboard/dashboard'),
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./features/patient-portal/appointment-history/appointment-history'),
      },
      {
        path: 'historial',
        loadComponent: () => import('./features/patient-portal/medical-history/medical-history'),
      },
      {
        path: 'documentos',
        loadComponent: () => import('./features/patient-portal/document-center/document-center'),
      },
      {
        path: 'recetas',
        loadComponent: () => import('./features/patient-portal/prescriptions/prescriptions'),
      },
      {
        path: 'facturacion',
        loadComponent: () => import('./features/patient-portal/billing/billing'),
      },
      {
        path: 'aseguradoras',
        loadComponent: () => import('./features/patient-portal/insurance/insurance'),
      },
      {
        path: 'recordatorios',
        loadComponent: () => import('./features/patient-portal/reminders/reminders'),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/patient-portal/profile/profile'),
      },
    ],
  },
  {
    path: 'control',
    loadComponent: () => import('./core/layouts/admin-layout/admin-layout'),
    children: [
      {
        path: 'management',
        loadComponent: () => import('./features/super-admin/management/management'),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/public/not-found/not-found'),
  },
];

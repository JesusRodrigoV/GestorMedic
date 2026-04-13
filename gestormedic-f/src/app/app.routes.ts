import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthStore } from '@features/auth/stores/auth.store';

const requireAuth: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  return authStore.isAuthenticated() || !!localStorage.getItem('gm_token')
    ? true
    : router.createUrlTree(['/auth/login']);
};

const staffOnly: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const user = authStore.user();
  if (!user) return true;
  return user.role_id === 3 ? router.createUrlTree(['/portal/appointments']) : true;
};

const patientOnly: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const user = authStore.user();
  if (!user) return true;
  return user.role_id === 3 ? true : router.createUrlTree(['/app/dashboard']);
};

export const routes: Routes = [
  {
    path: 'app',
    loadComponent: () => import('./core/layouts/admin-layout/admin-layout'),
    canActivate: [requireAuth, staffOnly],
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
        path: 'patients',
        loadComponent: () => import('./features/medical-admin/patient-list/patient-list'),
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/medical-admin/agenda/agenda'),
      },
      {
        path: 'medical-records',
        loadComponent: () => import('./features/medical-admin/history/history'),
      },
      {
        path: 'finance',
        loadComponent: () => import('./features/medical-admin/finance/finance'),
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
    ],
  },
  {
    path: 'portal',
    loadComponent: () => import('./core/layouts/admin-layout/admin-layout'),
    canActivate: [requireAuth, patientOnly],
    children: [
      {
        path: '',
        redirectTo: 'appointments',
        pathMatch: 'full',
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/patient-portal/appointment-history/appointment-history'),
      },
      {
        path: 'book',
        loadComponent: () => import('./features/patient-portal/book-appointment/book-appointment'),
      },
      {
        path: 'medical-history',
        loadComponent: () => import('./features/patient-portal/medical-history/medical-history'),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./core/layouts/public-layout/public-layout'),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/public/home/home'),
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
    path: '**',
    loadComponent: () => import('./features/public/not-found/not-found'),
  },
];

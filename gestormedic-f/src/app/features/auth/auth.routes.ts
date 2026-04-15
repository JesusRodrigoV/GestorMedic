import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth-guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../core/layouts/auth-layout/auth-layout'),
    canActivateChild: [authGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login'),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password'),
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register'),
      },
      {
        path: 'register/clinic',
        loadComponent: () => import('./register-clinic/register-clinic'),
      },
      {
        path: 'register/patient',
        loadComponent: () => import('./register-patient/register-patient'),
      },
      {
        path: 'register/doctor',
        loadComponent: () => import('./register-doctor/register-doctor'),
      },
    ],
  },
];

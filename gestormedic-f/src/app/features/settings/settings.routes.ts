import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings'),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () => import('./sections/profile/profile'),
      },
      {
        path: 'security',
        loadComponent: () => import('./sections/security/security'),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./sections/notifications/notifications'),
      },
      {
        path: 'appearance',
        loadComponent: () => import('./sections/appearance/appearance'),
      },
    ],
  },
];

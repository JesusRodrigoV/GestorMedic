import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'app',
    loadChildren: () =>
      import('./features/medical-admin/medical-admin.routes').then((m) => m.MEDICAL_ADMIN_ROUTES),
  },
  {
    path: 'portal',
    loadChildren: () =>
      import('./features/patient-portal/patient-portal.routes').then(
        (m) => m.PATIENT_PORTAL_ROUTES,
      ),
  },
  {
    path: 'control',
    loadChildren: () =>
      import('./features/super-admin/super-admin.routes').then((m) => m.SUPER_ADMIN_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./features/public/not-found/not-found'),
  },
];

import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../core/layouts/public-layout/public-layout'),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home'),
      },
      {
        path: 'especialidades',
        loadComponent: () => import('./sections-page/sections-page'),
        data: { page: 'especialidades' },
      },
      {
        path: 'directorio',
        loadComponent: () => import('./sections-page/sections-page'),
        data: { page: 'directorio' },
      },
      {
        path: 'videollamada',
        loadComponent: () => import('./sections-page/sections-page'),
        data: { page: 'videollamada' },
      },
      {
        path: 'recetas',
        loadComponent: () => import('./sections-page/sections-page'),
        data: { page: 'recetas' },
      },
      {
        path: 'nosotros',
        loadComponent: () => import('./sections-page/sections-page'),
        data: { page: 'nosotros' },
      },
      {
        path: 'acceso',
        loadComponent: () => import('./sections-page/sections-page'),
        data: { page: 'acceso' },
      },
      {
        path: 'search',
        loadComponent: () => import('./search/search'),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
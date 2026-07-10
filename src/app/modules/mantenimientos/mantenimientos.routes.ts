import { Routes } from '@angular/router';

export const MANTENIMIENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/mantenimientos-list/mantenimientos-list')
      .then(c => c.MantenimientosList)
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/mantenimiento-form/mantenimiento-form')
      .then(c => c.MantenimientoForm)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/mantenimiento-detail/mantenimiento-detail')
      .then(c => c.MantenimientoDetail)
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/mantenimiento-form/mantenimiento-form')
      .then(c => c.MantenimientoForm)
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./pages/mantenimiento-historial/mantenimiento-historial')
      .then(c => c.MantenimientoHistorial)
  }
];
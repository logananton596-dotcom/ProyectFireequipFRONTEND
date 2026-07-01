import { Routes } from '@angular/router';

export const ASIGNACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/asignaciones-list/asignaciones-list')
      .then(c => c.AsignacionesList)
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/asignacion-form/asignacion-form')
      .then(c => c.AsignacionForm)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/asignacion-detail/asignacion-detail')
      .then(c => c.AsignacionDetail)
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/asignacion-form/asignacion-form')
      .then(c => c.AsignacionForm)
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./pages/asignaciones-historial/asignaciones-historial')
      .then(c => c.AsignacionesHistorial)
  }
];
import { Routes } from '@angular/router';

export const EQUIPOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/equipos-list/equipos-list')
      .then(c => c.EquiposList)
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/equipo-form/equipo-form')
      .then(c => c.EquipoForm)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/equipo-detail/equipo-detail')
      .then(c => c.EquipoDetail)
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/equipo-form/equipo-form')
      .then(c => c.EquipoForm)
  }
];
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const EQUIPOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/equipos-list/equipos-list')
        .then(c => c.EquiposList),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/equipo-form/equipo-form')
        .then(c => c.EquiposForm),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/equipo-detail/equipo-detail')
        .then(c => c.EquiposDetail),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/equipo-form/equipo-form')
        .then(c => c.EquiposForm),
    canActivate: [authGuard]
  }
];
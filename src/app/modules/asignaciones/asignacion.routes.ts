import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ASIGNACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/asignacion-list/asignacion-list.component')
        .then(c => c.AsignacionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/asignacion-form/asignacion-form.component')
        .then(c => c.AsignacionFormComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/asignacion-detail/asignacion-detail.component')
        .then(c => c.AsignacionDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/asignacion-form/asignacion-form.component')
        .then(c => c.AsignacionFormComponent),
    canActivate: [authGuard]
  }
];
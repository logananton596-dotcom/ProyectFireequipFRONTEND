import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const VEHICULO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/vehiculo-list/vehiculo-list.component')
        .then(c => c.VehiculoListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/vehiculo-form/vehiculo-form.component')
        .then(c => c.VehiculoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/vehiculo-detail/vehiculo-detail.component')
        .then(c => c.VehiculoDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/vehiculo-form/vehiculo-form.component')
        .then(c => c.VehiculoFormComponent),
    canActivate: [authGuard]
  },
  // ============ SUBMÓDULO COMPARTIMIENTOS ============
  {
    path: ':vehiculoId/compartimientos',
    loadComponent: () =>
      import('./pages/vehiculo-detail/compartimentos/compartimientos-list.component')
        .then(c => c.CompartimientosListComponent),
    canActivate: [authGuard]
  },
  {
    path: ':vehiculoId/compartimientos/nuevo',
    loadComponent: () =>
      import('./pages/vehiculo-detail/compartimentos/compartimiento-form.component')
        .then(c => c.CompartimientoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: ':vehiculoId/compartimientos/:id',
    loadComponent: () =>
      import('./pages/vehiculo-detail/compartimentos/compartimiento-detail.component')
        .then(c => c.CompartimientoDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: ':vehiculoId/compartimientos/:id/editar',
    loadComponent: () =>
      import('./pages/vehiculo-detail/compartimentos/compartimiento-form.component')
        .then(c => c.CompartimientoFormComponent),
    canActivate: [authGuard]
  }
];
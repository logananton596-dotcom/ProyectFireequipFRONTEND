import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const UBICACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/ubicacion-list.component/ubicacion-list.component')
        .then(c => c.UbicacionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/ubicacion-form.component/ubicacion-form.component')
        .then(c => c.UbicacionFormComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/ubicacion-detail.component/ubicacion-detail.component')
        .then(c => c.UbicacionDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/ubicacion-form.component/ubicacion-form.component')
        .then(c => c.UbicacionFormComponent),
    canActivate: [authGuard]
  }
];
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CASILLERO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/casillero-list/casillero-list.component')
        .then(c => c.CasilleroListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/casillero-form/casillero-form.component')
        .then(c => c.CasilleroFormComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/casillero-detail/casillero-detail.component')
        .then(c => c.CasilleroDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/casillero-form/casillero-form.component')
        .then(c => c.CasilleroFormComponent),
    canActivate: [authGuard]
  }
];
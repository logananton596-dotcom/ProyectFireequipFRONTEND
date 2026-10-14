import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const EPP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/epp-list/epp-list')
        .then(c => c.EppList),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/epp-form/epp-form')
        .then(c => c.EppForm),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/epp-detail/epp-detail')
        .then(c => c.EppDetail),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/epp-form/epp-form')
        .then(c => c.EppForm),
    canActivate: [authGuard]
  }
];
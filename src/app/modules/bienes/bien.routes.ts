import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const BIEN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/bien-list/bien-list.component')
        .then(c => c.BienListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/bien-form/bien-form.component')
        .then(c => c.BienFormComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/bien-detail/bien-detail.component')
        .then(c => c.BienDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/bien-form/bien-form.component')
        .then(c => c.BienFormComponent),
    canActivate: [authGuard]
  }
];
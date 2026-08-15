import { Routes } from '@angular/router';
import { authGuard} from '../../core/guards/auth.guard';

export const OFICINA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/oficina-list/oficina-list.component')
        .then(c => c.OficinaListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/oficina-form/oficina-form.component')
        .then(c => c.OficinaFormComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/oficina-detail/oficina-detail.component')
        .then(c => c.OficinaDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/oficina-form/oficina-form.component')
        .then(c => c.OficinaFormComponent),
    canActivate: [authGuard]
  }
];
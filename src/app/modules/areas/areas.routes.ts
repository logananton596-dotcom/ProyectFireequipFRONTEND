import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const AREAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/areas-list/areas-list.component')
      .then(c => c.AreasListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/areas-form/areas-form.component')
      .then(c => c.AreasFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/areas-detail/areas-detail')
      .then(c => c.AreasDetail)
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/areas-form/areas-form.component')
      .then(c => c.AreasFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] }
  }
];
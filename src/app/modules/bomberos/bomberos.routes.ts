import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard'; // Asegúrate de ajustar la ruta de importación si varía

export const BOMBEROS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERADOR'] }, // Ambos ven la lista
    loadComponent: () =>
      import('./pages/bomberos-list/bomberos-list').then(c => c.BomberosList)  
  },
  {
    path: 'nuevo',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] }, // 💡 Solo el Administrador registra
    loadComponent: () =>
      import('./pages/bomberos-form/bomberos-form').then(c => c.BomberosForm)
  },
  {
    path: ':id',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERADOR'] },
    loadComponent: () =>
      import('./pages/bomberos-detail/bomberos-detail').then(c => c.BomberosDetail)
  },
  {
    path: ':id/editar',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] }, // 💡 Solo el Administrador edita
    loadComponent: () =>
      import('./pages/bomberos-form/bomberos-form').then(c => c.BomberosForm)
  }
];
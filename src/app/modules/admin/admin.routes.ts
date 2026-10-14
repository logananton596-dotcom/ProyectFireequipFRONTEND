import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  { path: 'usuarios', loadComponent: () => import('./pages/usuarios-list/usuarios-list.component').then(m => m.UsuariosListComponent), canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'usuarios/nuevo', loadComponent: () => import('./pages/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent), canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'usuarios/:id/editar', loadComponent: () => import('./pages/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent), canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'tipos-equipo', loadComponent: () => import('./pages/tipos-equipo-list/tipos-equipo-list.component').then(m => m.TiposEquipoListComponent), canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'tipos-equipo/nuevo', loadComponent: () => import('./pages/tipo-equipo-form/tipo-equipo-form.component').then(m => m.TipoEquipoFormComponent), canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'tipos-equipo/:id/editar', loadComponent: () => import('./pages/tipo-equipo-form/tipo-equipo-form.component').then(m => m.TipoEquipoFormComponent), canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
];
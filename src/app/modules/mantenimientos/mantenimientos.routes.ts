import { Routes } from '@angular/router';

export const MANTENIMIENTOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/mantenimientos-list/mantenimientos-list').then(m => m.MantenimientosList) },
  { path: 'nuevo', loadComponent: () => import('./pages/mantenimiento-form/mantenimiento-form').then(m => m.MantenimientoForm) },
  { path: 'historial', loadComponent: () => import('./pages/mantenimiento-historial/mantenimiento-historial').then(m => m.MantenimientoHistorial) }
];
import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  { path: 'equipos', loadComponent: () => import('./pages/reporte-equipos/reporte-equipos').then(m => m.ReporteEquipos) },
  { path: 'asignaciones', loadComponent: () => import('./pages/reporte-asignaciones/reporte-asignaciones').then(m => m.ReporteAsignaciones) },
  { path: 'mantenimientos', loadComponent: () => import('./pages/reporte-mantenimientos/reporte-mantenimientos').then(m => m.ReporteMantenimientos) },
  { path: '', redirectTo: 'equipos', pathMatch: 'full' }
];

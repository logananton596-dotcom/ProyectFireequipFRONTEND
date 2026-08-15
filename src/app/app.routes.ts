import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/auth/pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./modules/auth/pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/pages/dashboard-main/dashboard-main.component').then(m => m.DashboardMainComponent)
      },
      {
        path: 'equipos',
        loadChildren: () => import('./modules/equipos/equipos.routes').then(m => m.EQUIPOS_ROUTES)
      },
      {
        path: 'epp',
        loadChildren: () => import('./modules/epp/epp.routes').then(m => m.EPP_ROUTES)
      },
      {
      path: 'bienes',
      loadChildren: () => import('./modules/bienes/bien.routes').then(r => r.BIEN_ROUTES)
      },
      {
        path: 'bomberos',
        loadChildren: () => import('./modules/bomberos/bomberos.routes').then(m => m.BOMBEROS_ROUTES)
      },
      {
      path: 'vehiculos',
      loadChildren: () =>
        import('./modules/vehiculos/vehiculo.routes').then(r => r.VEHICULO_ROUTES)
      },
      {
        path: 'areas',
        loadChildren: () => import('./modules/areas/areas.routes').then(m => m.AREAS_ROUTES)
      },
      {
        path: 'ubicaciones',
        loadChildren: () =>
          import('./modules/ubicaciones/ubicaciones.routes').then(r => r.UBICACIONES_ROUTES)
      },
      {
      path: 'oficinas',
      loadChildren: () =>
        import('./modules/oficinas/oficina.routes').then(r => r.OFICINA_ROUTES)
      },
      {
      path: 'casilleros',
      loadChildren: () =>
        import('./modules/casilleros/casillero.routes')
          .then(r => r.CASILLERO_ROUTES)
      },
      {
        path: 'asignaciones',
        loadChildren: () =>
          import('./modules/asignaciones/asignacion.routes').then(r => r.ASIGNACION_ROUTES)
      },
      {
        path: 'mantenimientos',
        loadChildren: () => import('./modules/mantenimientos/mantenimientos.routes').then(m => m.MANTENIMIENTOS_ROUTES)
      },
      {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },
      {
        path: 'reportes',
        loadChildren: () => import('./modules/reportes/reportes.routes').then(m => m.REPORTES_ROUTES)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
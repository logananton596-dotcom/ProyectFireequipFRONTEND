import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = route.data?.['roles'] as string[];
  const toastr = inject(ToastrService);
// 1. Si la ruta no exige roles, pasa directo sin molestar
  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  // 2. Leemos de forma segura el valor actual de tu nueva Signal
  const user = authService.getCurrentUserValue();
  
  // 3. Extraemos el nombre del rol del objeto anidado (ej: de 'ROLE_ADMIN' a 'ADMIN')
  const userRole = user?.rol?.nombre ? user.rol.nombre.replace('ROLE_', '') : null;

  
  // 4. Si el rol del usuario coincide con los permitidos en la ruta, el acceso es limpio
  if (user && userRole && expectedRoles.includes(userRole)) {
    return true;
  }

  // 5. Solo si realmente no cumple las condiciones, mostramos la alerta y lo botamos
  toastr.error('No tiene permisos para acceder a esta página', 'Acceso dEenegado');
  return router.parseUrl('/dashboard');
};
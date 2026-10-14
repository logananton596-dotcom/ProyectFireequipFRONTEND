import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  // Evaluamos la ruta actual del intento de navegación
  const isAuthRoute = state.url.includes('/auth/login') || state.url.includes('/auth/register');

  // Regla 1: Si ya inició sesión e intenta ir al login o registro (ej: botón Atrás)
  if (isAuthenticated && isAuthRoute) {
    return router.parseUrl('/dashboard'); // Lo retenemos en el dashboard
  }

  // Regla 2: Si no ha iniciado sesión e intenta ir a páginas protegidas
  if (!isAuthenticated && !isAuthRoute) {
    return router.parseUrl('/auth/login'); // Lo obligamos a loguearse
  }

  // Si no cumple ninguna de las anteriores (ej: no está logueado e ingresa al login), pasa normal
  return true;
};
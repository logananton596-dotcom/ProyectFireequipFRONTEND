import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
// CORRECCIÓN: Agregamos el prefijo '/api' para que la coincidencia sea exacta y no confunda '/auth/me'
  const publicEndpoints = ['/api/auth/login', '/api/auth/register'];
  const isPublic = publicEndpoints.some(url => req.url.includes(url)|| req.url.includes(url + '?') || req.url === url);
  
  // Si no es un endpoint de login/registro y tenemos un token, lo inyectamos de forma segura
  if (!isPublic && token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }
  
  return next(req);
};
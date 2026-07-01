import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
        toastr.error('Sesión expirada', 'Error');
      } else if (error.status === 403) {
        toastr.error('No tiene permisos', 'Acceso deneegado');
      } else if (error.status === 404) {
        toastr.error('Recurso no encontrado', 'Error');
      } else if (error.status >= 500) {
        toastr.error('Error interno del servidor', 'Error');
      } else if (error.error?.message) {
        toastr.error(error.error.message, 'Error');
      }
      return throwError(() => error);
    })
  );
};
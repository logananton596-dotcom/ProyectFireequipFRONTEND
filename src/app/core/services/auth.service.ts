import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);

    // 1. Reemplazamos BehaviorSubject por una WritableSignal privada
  private currentUserSignal = signal<Usuario | null>(null);

  // 2. Exponemos una Signal de solo lectura para los componentes (Navbar, Sidebar)
  public currentUser = this.currentUserSignal.asReadonly();
  
  constructor() {
    // 3. Recuperamos el usuario de localStorage al arrancar usando .set()
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSignal.set(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            this.getCurrentUser().subscribe();
          }
        })
      );
  }

  getCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`).pipe(
      tap(usuario => {
        localStorage.setItem('currentUser', JSON.stringify(usuario));
       // 4. Actualizamos la Signal con el nuevo usuario devuelto por el Backend
        this.currentUserSignal.set(usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
     // 4. Actualizamos la Signal con null
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']); 
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // 6. Mantenemos este método leyendo el valor actual de la Signal con ()
  getCurrentUserValue(): Usuario | null {
    return this.currentUserSignal();
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.rolNombre === roleName;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

    register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }
}
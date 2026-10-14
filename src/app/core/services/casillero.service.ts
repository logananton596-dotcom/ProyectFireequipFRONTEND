import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Casillero } from '../models/casillero.model';

@Injectable({
  providedIn: 'root'
})
export class CasilleroService extends ApiService {

  // CRUD Principal
  getAll(): Observable<Casillero[]> {
    return this.get<Casillero[]>('casilleros');
  }

  getById(id: number): Observable<Casillero> {
    return this.get<Casillero>(`casilleros/${id}`);
  }

  getActivos(): Observable<Casillero[]> {
    return this.get<Casillero[]>('casilleros/activos');
  }

  getDisponibles(): Observable<Casillero[]> {
    return this.get<Casillero[]>('casilleros/disponibles');
  }

  getByBombero(bomberoId: number): Observable<Casillero> {
    return this.get<Casillero>(`casilleros/bombero/${bomberoId}`);
  }

  buscar(query: string): Observable<Casillero[]> {
    return this.get<Casillero[]>(`casilleros/buscar?q=${encodeURIComponent(query)}`);
  }

  create(data: Partial<Casillero>): Observable<Casillero> {
    return this.post<Casillero>('casilleros', data);
  }

  update(id: number, data: Partial<Casillero>): Observable<Casillero> {
    return this.put<Casillero>(`casilleros/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`casilleros/${id}`);
  }

  // Cambiar estado (activo/inactivo)
  cambiarEstado(id: number, activo: boolean): Observable<void> {
    return this.patch<void>(`casilleros/${id}/estado?activo=${activo}`);
  }

  // Asignar casillero a un bombero
  asignar(id: number, bomberoId: number): Observable<void> {
    return this.patch<void>(`casilleros/${id}/asignar?bomberoId=${bomberoId}`);
  }

  // Liberar casillero (quitar bombero)
  liberar(id: number): Observable<void> {
    return this.patch<void>(`casilleros/${id}/liberar`);
  }
}
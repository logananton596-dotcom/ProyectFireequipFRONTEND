import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Equipo } from '../models/equipo.model';

@Injectable({
  providedIn: 'root'
})
export class EquipoService extends ApiService {

  // CRUD Principal
  getAll(): Observable<Equipo[]> {
    return this.get<Equipo[]>('equipos');
  }

  getById(id: number): Observable<Equipo> {
    return this.get<Equipo>(`equipos/${id}`);
  }

  create(data: Partial<Equipo>): Observable<Equipo> {
    return this.post<Equipo>('equipos', data);
  }

  update(id: number, data: Partial<Equipo>): Observable<Equipo> {
    return this.put<Equipo>(`equipos/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`equipos/${id}`);
  }

  // Métodos adicionales
  getByEstado(estado: string): Observable<Equipo[]> {
    return this.get<Equipo[]>(`equipos/estado/${estado}`);
  }

  getByArea(areaId: number): Observable<Equipo[]> {
    return this.get<Equipo[]>(`equipos/area/${areaId}`);
  }

  getDisponibles(): Observable<Equipo[]> {
    return this.get<Equipo[]>('equipos/disponibles');
  }
}
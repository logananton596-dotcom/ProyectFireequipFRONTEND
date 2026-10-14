import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Mantenimiento } from '../models/mantenimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService extends ApiService {

  getAll(): Observable<Mantenimiento[]> {
    return this.get<Mantenimiento[]>('mantenimientos');
  }

  getById(id: number): Observable<Mantenimiento> {
    return this.get<Mantenimiento>(`mantenimientos/${id}`);
  }

  create(data: Partial<Mantenimiento>): Observable<Mantenimiento> {
    return this.post<Mantenimiento>('mantenimientos', data);
  }

  update(id: number, data: Partial<Mantenimiento>): Observable<Mantenimiento> {
    return this.put<Mantenimiento>(`mantenimientos/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`mantenimientos/${id}`);
  }

  getByEquipo(equipoId: number): Observable<Mantenimiento[]> {
    return this.get<Mantenimiento[]>(`mantenimientos/equipo/${equipoId}`);
  }
}
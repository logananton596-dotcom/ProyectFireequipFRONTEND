import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AsignacionEquipo } from '../models/asignacion.model';

@Injectable({
  providedIn: 'root'
})
export class AsignacionEquipoService extends ApiService {

  getAll(): Observable<AsignacionEquipo[]> {
    return this.get<AsignacionEquipo[]>('asignacionesEquipos');
  }

  getById(id: number): Observable<AsignacionEquipo> {
    return this.get<AsignacionEquipo>(`asignacionesEquipos/${id}`);
  }

  create(data: Partial<AsignacionEquipo>): Observable<AsignacionEquipo> {
    return this.post<AsignacionEquipo>('asignacionesEquipos', data);
  }

  update(id: number, data: Partial<AsignacionEquipo>): Observable<AsignacionEquipo> {
    return this.put<AsignacionEquipo>(`asignacionesEquipos/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`asignacionesEquipos/${id}`);
  }

  // Métodos específicos de asignaciones
  getByBombero(bomberoId: number): Observable<AsignacionEquipo[]> {
    return this.get<AsignacionEquipo[]>(`asignacionesEquipos/bombero/${bomberoId}`);
  }

  getByEquipo(equipoId: number): Observable<AsignacionEquipo[]> {
    return this.get<AsignacionEquipo[]>(`asignacionesEquipos/equipo/${equipoId}`);
  }

  devolver(id: number): Observable<AsignacionEquipo> {
    return this.put<AsignacionEquipo>(`asignacionesEquipos/${id}/devolver`, {});
  }
}

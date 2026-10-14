import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Asignacion, CrearAsignacionRequest, DevolverAsignacionRequest } from '../models/asignacion.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService extends ApiService {

  // ========== CRUD PRINCIPAL ==========

  getAll(): Observable<Asignacion[]> {
    return this.get<Asignacion[]>('asignaciones');
  }

  getById(id: number): Observable<Asignacion> {
    return this.get<Asignacion>(`asignaciones/${id}`);
  }

  getActivas(): Observable<Asignacion[]> {
    return this.get<Asignacion[]>('asignaciones/activas');
  }

  getByEstado(estado: string): Observable<Asignacion[]> {
    return this.get<Asignacion[]>(`asignaciones/estado/${estado}`);
  }

  // ========== FILTROS POR RECURSO ==========

  getByEquipo(equipoId: number): Observable<Asignacion[]> {
    return this.get<Asignacion[]>(`asignaciones/equipo/${equipoId}`);
  }

  getByEpp(eppId: number): Observable<Asignacion[]> {
    return this.get<Asignacion[]>(`asignaciones/epp/${eppId}`);
  }

  getByBien(bienId: number): Observable<Asignacion[]> {
    return this.get<Asignacion[]>(`asignaciones/bien/${bienId}`);
  }

  // ========== FILTROS POR DESTINO ==========

  getByBombero(bomberoId: number): Observable<Asignacion[]> {
    return this.get<Asignacion[]>(`asignaciones/bombero/${bomberoId}`);
  }

  getByVehiculo(vehiculoId: number): Observable<Asignacion[]> {
    return this.get<Asignacion[]>(`asignaciones/vehiculo/${vehiculoId}`);
  }

  getByUbicacion(ubicacionId: number): Observable<Asignacion[]> {
    return this.get<Asignacion[]>(`asignaciones/ubicacion/${ubicacionId}`);
  }

  // ========== OPERACIONES CRUD ==========

  create(data: CrearAsignacionRequest): Observable<Asignacion> {
    return this.post<Asignacion>('asignaciones', data);
  }

  update(id: number, data: CrearAsignacionRequest): Observable<Asignacion> {
    return this.put<Asignacion>(`asignaciones/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`asignaciones/${id}`);
  }

  // ========== OPERACIONES DE DEVOLUCIÓN ==========

  devolver(id: number, fechaDevolucion?: string, observaciones?: string): Observable<Asignacion> {
    let params = new HttpParams();
    if (fechaDevolucion) params = params.set('fechaDevolucion', fechaDevolucion);
    if (observaciones) params = params.set('observaciones', observaciones);
    return this.http.patch<Asignacion>(`${this.apiUrl}/asignaciones/${id}/devolver`, null, { params });
  }

  devolverConJson(id: number, data: DevolverAsignacionRequest): Observable<Asignacion> {
    return this.patch<Asignacion>(`asignaciones/${id}/devolver-con-json`, data);
  }
}
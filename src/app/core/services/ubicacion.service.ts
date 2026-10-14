import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Ubicacion } from '../models/ubicacion.model';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService extends ApiService {

  // CRUD Principal
  getAll(): Observable<Ubicacion[]> {
    return this.get<Ubicacion[]>('ubicaciones');
  }

  getActivas(): Observable<Ubicacion[]> {
    return this.get<Ubicacion[]>('ubicaciones/activas');
  }

  getById(id: number): Observable<Ubicacion> {
    return this.get<Ubicacion>(`ubicaciones/${id}`);
  }

  getByNombre(nombre: string): Observable<Ubicacion> {
    return this.get<Ubicacion>(`ubicaciones/nombre/${nombre}`);
  }

  getByTipo(tipo: string): Observable<Ubicacion[]> {
    return this.get<Ubicacion[]>(`ubicaciones/tipo/${tipo}`);
  }

  create(data: Partial<Ubicacion>): Observable<Ubicacion> {
    return this.post<Ubicacion>('ubicaciones', data);
  }

  update(id: number, data: Partial<Ubicacion>): Observable<Ubicacion> {
    return this.put<Ubicacion>(`ubicaciones/${id}`, data);
  }

  activar(id: number): Observable<Ubicacion> {
    return this.patch<Ubicacion>(`ubicaciones/${id}/activar`);
  }

  desactivar(id: number): Observable<Ubicacion> {
    return this.patch<Ubicacion>(`ubicaciones/${id}/desactivar`);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`ubicaciones/${id}`);
  }
}
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Vehiculo } from '../models/vehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService extends ApiService {

  // CRUD Principal
  getAll(): Observable<Vehiculo[]> {
    return this.get<Vehiculo[]>('vehiculos');
  }

  getById(id: number): Observable<Vehiculo> {
    return this.get<Vehiculo>(`vehiculos/${id}`);
  }

  getActivos(): Observable<Vehiculo[]> {
    return this.get<Vehiculo[]>('vehiculos/activos');
  }

  create(data: Partial<Vehiculo>): Observable<Vehiculo> {
    return this.post<Vehiculo>('vehiculos', data);
  }

  update(id: number, data: Partial<Vehiculo>): Observable<Vehiculo> {
    return this.put<Vehiculo>(`vehiculos/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`vehiculos/${id}`);
  }

    // Activar / Desactivar (coincide con @PatchMapping("/{id}/activar") y "/desactivar")
  activar(id: number): Observable<Vehiculo> {
    return this.patch<Vehiculo>(`vehiculos/${id}/activar`);
  }

  desactivar(id: number): Observable<Vehiculo> {
    return this.patch<Vehiculo>(`vehiculos/${id}/desactivar`);
  }

  cambiarEstado(id: number, nuevoEstado: string): Observable<Vehiculo> {
    return this.patch<Vehiculo>(`vehiculos/${id}/estado?nuevoEstado=${nuevoEstado}`);
  }

  getActivosOperativos(): Observable<Vehiculo[]> {
    return this.get<Vehiculo[]>('vehiculos/activos/operativos');
  }
}
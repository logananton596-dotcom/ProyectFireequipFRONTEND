import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Compartimiento } from '../models/compartimiento.model';

@Injectable({
  providedIn: 'root'
})
export class CompartimientoService extends ApiService {

  // CRUD Principal
  getAll(): Observable<Compartimiento[]> {
    return this.get<Compartimiento[]>('compartimientos');
  }

  getById(id: number): Observable<Compartimiento> {
    return this.get<Compartimiento>(`compartimientos/${id}`);
  }

  getByVehiculo(vehiculoId: number): Observable<Compartimiento[]> {
    return this.get<Compartimiento[]>(`compartimientos/vehiculo/${vehiculoId}`);
  }

  getActivos(): Observable<Compartimiento[]> {
    return this.get<Compartimiento[]>('compartimientos/activos');
  }

  create(data: Partial<Compartimiento>): Observable<Compartimiento> {
    return this.post<Compartimiento>('compartimientos', data);
  }

  update(id: number, data: Partial<Compartimiento>): Observable<Compartimiento> {
    return this.put<Compartimiento>(`compartimientos/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`compartimientos/${id}`);
  }

  // Cambiar estado (activo/inactivo)
  cambiarEstado(id: number, activo: boolean): Observable<void> {
    return this.patch<void>(`compartimientos/${id}/estado?activo=${activo}`);
  }
}
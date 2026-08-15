import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Oficina } from '../models/oficina.model';

@Injectable({
  providedIn: 'root'
})
export class OficinaService extends ApiService {

  // CRUD Principal
  getAll(): Observable<Oficina[]> {
    return this.get<Oficina[]>('oficinas');
  }

  getById(id: number): Observable<Oficina> {
    return this.get<Oficina>(`oficinas/${id}`);
  }

  getActivas(): Observable<Oficina[]> {
    return this.get<Oficina[]>('oficinas/activas');
  }

  buscar(query: string): Observable<Oficina[]> {
    return this.get<Oficina[]>(`oficinas/buscar?q=${encodeURIComponent(query)}`);
  }

  create(data: Partial<Oficina>): Observable<Oficina> {
    return this.post<Oficina>('oficinas', data);
  }

  update(id: number, data: Partial<Oficina>): Observable<Oficina> {
    return this.put<Oficina>(`oficinas/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`oficinas/${id}`);
  }

  // Cambiar estado (activo/inactivo)
  cambiarEstado(id: number, activo: boolean): Observable<void> {
    return this.patch<void>(`oficinas/${id}/estado?activo=${activo}`);
  }
}
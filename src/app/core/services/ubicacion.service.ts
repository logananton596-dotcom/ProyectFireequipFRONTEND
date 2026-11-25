import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Ubicacion, TipoUbicacion } from '../models/ubicacion.model';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService extends ApiService {
  private readonly endpoint = 'ubicaciones';

  // Listados
  getAll(): Observable<Ubicacion[]> {
    return this.get<Ubicacion[]>(this.endpoint);
  }

  getActivas(): Observable<Ubicacion[]> {
    return this.get<Ubicacion[]>(`${this.endpoint}/activas`);
  }

  getPorTipo(tipo: TipoUbicacion): Observable<Ubicacion[]> {
    return this.get<Ubicacion[]>(`${this.endpoint}/tipo/${tipo}`);
  }

  getRaices(): Observable<Ubicacion[]> {
    return this.get<Ubicacion[]>(`${this.endpoint}/raices`);
  }

  getHijas(padreId: number): Observable<Ubicacion[]> {
    return this.get<Ubicacion[]>(`${this.endpoint}/${padreId}/hijas`);
  }

  getById(id: number): Observable<Ubicacion> {
    return this.get<Ubicacion>(`${this.endpoint}/${id}`);
  }

  // CRUD
  create(ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.post<Ubicacion>(this.endpoint, ubicacion);
  }

  update(id: number, ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.put<Ubicacion>(`${this.endpoint}/${id}`, ubicacion);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  cambiarActiva(id: number, activa: boolean): Observable<Ubicacion> {
    return this.patch<Ubicacion>(`${this.endpoint}/${id}/activa?activa=${activa}`);
  }
}
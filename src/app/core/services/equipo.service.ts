import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Ajusta la ruta a tu environment
import { ApiService } from './api.service';
import { Equipo, TipoEquipo, EstadoEquipo } from '../models/equipo.model';

@Injectable({
  providedIn: 'root',
})
export class EquipoService extends ApiService {

  // ==========================================
  //  MÉTODOS DE EQUIPOS
  // ==========================================

  getAll(): Observable<Equipo[]> {
    return this.get<Equipo[]>('equipos');
  }

  getById(id: number): Observable<Equipo> {
    return this.get<Equipo>(`equipos/${id}`);
  }

  // Usamos Partial<Equipo> porque al crear no envías el 'id'
  create(data: Partial<Equipo>): Observable<Equipo> {
    return this.post<Equipo>('equipos', data);
  }

  // Usamos Partial<Equipo> porque al editar puedes enviar solo los campos modificados
  update(id: number, data: Partial<Equipo>): Observable<Equipo> {
    return this.put<Equipo>(`equipos/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`equipos/${id}`);
  }

  // ==========================================
  // SUB-RECURSOS ASOCIADOS
  // ==========================================

  getTipos(): Observable<TipoEquipo[]> {
    return this.get<TipoEquipo[]>('tipos-equipo');
  }

  getEstados(): Observable<EstadoEquipo[]> {
    return this.get<EstadoEquipo[]>('estados-equipo');
  }
}
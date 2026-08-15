
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Epp } from '../models/epp.model';

@Injectable({
  providedIn: 'root'
})
export class EppService extends ApiService {

  // ========== CRUD PRINCIPAL ==========

// Obtiene todos los EPP
  getAll(): Observable<Epp[]> {
    return this.get<Epp[]>('epps');
  }

// Obtiene un EPP por ID
  getById(id: number): Observable<Epp> {
    return this.get<Epp>(`epps/${id}`);
  }

// Crea un nuevo EPP
  create(data: Partial<Epp>): Observable<Epp> {
    return this.post<Epp>('epps', data);
  }

//Actualiza un EPP existente
  update(id: number, data: Partial<Epp>): Observable<Epp> {
    return this.put<Epp>(`epps/${id}`, data);
  }

//Elimina un EPP
  deleteById(id: number): Observable<void> {
    return this.delete<void>(`epps/${id}`);
  }

  // ========== MÉTODOS ADICIONALES ==========

//Obtiene EPP por estado
  getByEstado(estado: string): Observable<Epp[]> {
    return this.get<Epp[]>(`epps/estado/${estado}`);
  }

// Obtiene EPP por área
 getByArea(areaId: number): Observable<Epp[]> {
    return this.get<Epp[]>(`epps/area/${areaId}`);
  }

//Obtiene EPP no asignados (para asignaciones)
  getDisponibles(): Observable<Epp[]> {
    return this.get<Epp[]>('epps/disponibles');
  }
//Cambia el estado de un EPP (con motivo de baja)
  cambiarEstado(id: number, nuevoEstado: string, motivo?: string, fechaBaja?: string): Observable<void> {
    let url = `epps/${id}/estado?nuevoEstado=${nuevoEstado}`;
    
    if (motivo) {
      url += `&motivo=${encodeURIComponent(motivo)}`;
    }
    
    if (fechaBaja) {
      url += `&fechaBaja=${fechaBaja}`;
    }
    
    return this.patch<void>(url);
  }
}
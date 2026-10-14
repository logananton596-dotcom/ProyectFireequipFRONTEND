// src/app/core/services/bombero.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Bombero } from '../models/bombero.model';

@Injectable({
  providedIn: 'root'
})

export class BomberoService extends ApiService {


  getActivos(): Observable<Bombero[]> {
    return this.get<Bombero[]>('bomberos/activos');
  }

  getAll(): Observable<Bombero[]> {
    return this.get<Bombero[]>('bomberos');
  }

  getById(id: number): Observable<Bombero> {
    return this.get<Bombero>(`bomberos/${id}`);
  }

  create(data: Partial<Bombero>): Observable<Bombero> {
    return this.post<Bombero>('bomberos', data);
  }

  update(id: number, data: Partial<Bombero>): Observable<Bombero> {
    return this.put<Bombero>(`bomberos/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`bomberos/${id}`);
  }

  
  cambiarEstado(id: number, nuevoEstado: string, motivo?: string): Observable<void> {
    // Construir URL con query params
    let url = `bomberos/${id}/estado?nuevoEstado=${nuevoEstado}`;
    if (motivo) {
      url += `&motivo=${encodeURIComponent(motivo)}`;
    } 
    return this.patch<void>(url);
  }
}
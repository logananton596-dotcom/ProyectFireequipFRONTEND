import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Bien } from '../models/bien.model';

@Injectable({
  providedIn: 'root'
})
export class BienService extends ApiService {

  // CRUD Principal
  getAll(): Observable<Bien[]> {
    return this.get<Bien[]>('bienes');
  }

  getById(id: number): Observable<Bien> {
    return this.get<Bien>(`bienes/${id}`);
  }

  create(data: Partial<Bien>): Observable<Bien> {
    return this.post<Bien>('bienes', data);
  }

  update(id: number, data: Partial<Bien>): Observable<Bien> {
    return this.put<Bien>(`bienes/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`bienes/${id}`);
  }

  // Métodos adicionales
  getByEstado(estado: string): Observable<Bien[]> {
    return this.get<Bien[]>(`bienes/estado/${estado}`);
  }

  getByArea(area: string): Observable<Bien[]> {
    return this.get<Bien[]>(`bienes/area/${area}`);
  }
}
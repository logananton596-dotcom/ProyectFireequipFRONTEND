import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Bombero } from '../models/bombero.model';

@Injectable({
  providedIn: 'root'
})
export class BomberoService extends ApiService {

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
}
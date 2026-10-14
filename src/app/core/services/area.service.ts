import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Area } from '../models/area.model';

@Injectable({
  providedIn: 'root'
})
export class AreaService extends ApiService {

  getAll(): Observable<Area[]> {
    return this.get<Area[]>('areas');
  }

  getById(id: number): Observable<Area> {
    return this.get<Area>(`areas/${id}`);
  }

  create(data: Partial<Area>): Observable<Area> {
    return this.post<Area>('areas', data);
  }

  update(id: number, data: Partial<Area>): Observable<Area> {
    return this.put<Area>(`areas/${id}`, data);
  }

  deleteById(id: number): Observable<void> {
    return this.delete<void>(`areas/${id}`);
  }
}

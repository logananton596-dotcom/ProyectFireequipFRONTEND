import { Bombero } from './bombero.model';

// ==================== INTERFACE ====================

export interface Casillero {
  id?: number;
  codigo: string;
  numero: string;
  descripcion?: string;
  piso?: string;
  edificio?: string;
  capacidad?: number;
  bomberoId?: number | null;
  bombero?: Bombero;
  activo: boolean;
  observaciones?: string;
}

// ==================== HELPERS ====================

export function getEstadoCasilleroBadgeClass(activo: boolean): string {
  return activo ? 'bg-success text-white' : 'bg-secondary text-white';
}

export function formatearEstadoCasillero(activo: boolean): string {
  return activo ? 'Activo' : 'Inactivo';
}

export function getCasilleroDisplay(casillero: Casillero): string {
  return `${casillero.codigo} - ${casillero.numero}`;
}

export function getAsignacionBadgeClass(bomberoId?: number | null): string {
  return bomberoId ? 'bg-primary text-white' : 'bg-secondary text-white';
}

export function formatearAsignacion(bomberoId?: number | null): string {
  return bomberoId ? 'Asignado' : 'Disponible';
}
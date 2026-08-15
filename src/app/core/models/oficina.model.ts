import { Bombero } from './bombero.model';

// ==================== INTERFACE ====================

export interface Oficina {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  piso?: string;
  edificio?: string;
  capacidad?: number;
  responsableId?: number | null;
  responsable?: Bombero;
  activo: boolean;
  observaciones?: string;
}

// ==================== HELPERS ====================

export function getEstadoOficinaBadgeClass(activo: boolean): string {
  return activo ? 'bg-success text-white' : 'bg-secondary text-white';
}

export function formatearEstadoOficina(activo: boolean): string {
  return activo ? 'Activa' : 'Inactiva';
}

export function getOficinaDisplay(oficina: Oficina): string {
  return `${oficina.codigo} - ${oficina.nombre}`;
}
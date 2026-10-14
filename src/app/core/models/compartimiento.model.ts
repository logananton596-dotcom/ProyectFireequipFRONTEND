import { Vehiculo } from './vehiculo.model';

// ==================== INTERFACE ====================

export interface Compartimiento {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  capacidad?: number;
  vehiculoId: number;
  vehiculo?: Vehiculo;
  activo: boolean;
  observaciones?: string;
}

// ==================== HELPERS ====================

export function getEstadoCompartimientoBadgeClass(activo: boolean): string {
  return activo ? 'bg-success text-white' : 'bg-secondary text-white';
}

export function formatearEstadoCompartimiento(activo: boolean): string {
  return activo ? 'Activo' : 'Inactivo';
}
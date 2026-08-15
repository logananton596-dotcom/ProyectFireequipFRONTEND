import { Area } from './area.model';
import { Ubicacion } from './ubicacion.model';

// ==================== ENUMS ====================

export type TipoBien = 
  | 'EQUIPO_INFORMATICO'
  | 'MOBILIARIO'
  | 'VEHICULO'
  | 'HERRAMIENTA'
  | 'INSTRUMENTO'
  | 'MAQUINARIA'
  | 'INSTALACION'
  | 'OTRO';

export type EstadoBien = 
  | 'OPERATIVO'
  | 'MANTENIMIENTO'
  | 'BAJA'
  | 'OBSOLETO';

export type CondicionBien = 
  | 'NUEVO'
  | 'BUENO'
  | 'REGULAR'
  | 'MALO'
  | 'INSERVIBLE';

// ==================== CONSTANTES ====================

export const TIPOS_BIEN: TipoBien[] = [
  'EQUIPO_INFORMATICO',
  'MOBILIARIO',
  'VEHICULO',
  'HERRAMIENTA',
  'INSTRUMENTO',
  'MAQUINARIA',
  'INSTALACION',
  'OTRO'
];

export const ESTADOS_BIEN: EstadoBien[] = [
  'OPERATIVO',
  'MANTENIMIENTO',
  'BAJA',
  'OBSOLETO'
];

export const CONDICIONES_BIEN: CondicionBien[] = [
  'NUEVO',
  'BUENO',
  'REGULAR',
  'MALO',
  'INSERVIBLE'
];

// ==================== INTERFACE ====================

export interface Bien {
  id?: number;
  codigoCgbvp: string;
  nombre: string;
  tipoBien: TipoBien;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  fechaAdquisicion: Date | string;
  estado: EstadoBien;
  condicion?: CondicionBien;
  valorReferencial?: number;
  especificaciones?: string;
  observaciones?: string;
  area: string; // Nombre del área (Enum)
  ubicacionId: number;
  codigoUbicacion?: string; // Para mostrar en lista/detalle
  nombreUbicacion?: string; // Para mostrar en lista/detalle
  activo: boolean;
}

// ==================== HELPERS ====================

export function formatearTipoBien(tipo: TipoBien): string {
  return tipo.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function formatearEstadoBien(estado: EstadoBien): string {
  return estado.toLowerCase().replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function formatearCondicionBien(condicion: CondicionBien): string {
  return condicion.toLowerCase().replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function getEstadoBienBadgeClass(estado: EstadoBien): string {
  switch (estado) {
    case 'OPERATIVO': return 'bg-success text-white';
    case 'MANTENIMIENTO': return 'bg-warning text-dark';
    case 'BAJA': return 'bg-danger text-white';
    case 'OBSOLETO': return 'bg-secondary text-white';
    default: return 'bg-secondary text-white';
  }
}

export function getCondicionBienBadgeClass(condicion: CondicionBien): string {
  switch (condicion) {
    case 'NUEVO': return 'bg-primary text-white';
    case 'BUENO': return 'bg-success text-white';
    case 'REGULAR': return 'bg-warning text-dark';
    case 'MALO': return 'bg-danger text-white';
    case 'INSERVIBLE': return 'bg-secondary text-white';
    default: return 'bg-secondary text-white';
  }
}
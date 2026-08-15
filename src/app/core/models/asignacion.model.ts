import { Bombero } from './bombero.model';
import { Vehiculo } from './vehiculo.model';
import { Ubicacion } from './ubicacion.model';
import { Compartimiento } from './compartimiento.model';
import { Equipo } from './equipo.model';
import { Epp } from './epp.model';
import { Bien } from './bien.model';

// ==================== ENUMS ====================

export type EstadoAsignacion = 'ACTIVA' | 'DEVUELTA' | 'VENCIDA';
export type TipoDestino = 'BOMBERO' | 'VEHICULO' | 'UBICACION';
export type TipoRecurso = 'EQUIPO' | 'EPP' | 'BIEN';

// ==================== CONSTANTES ====================

export const ESTADOS_ASIGNACION: EstadoAsignacion[] = ['ACTIVA', 'DEVUELTA', 'VENCIDA'];
export const TIPOS_DESTINO: TipoDestino[] = ['BOMBERO', 'VEHICULO', 'UBICACION'];
export const TIPOS_RECURSO: TipoRecurso[] = ['EQUIPO', 'EPP', 'BIEN'];

// ==================== INTERFACES ====================

export interface Asignacion {
  id: number;
  equipoId: number | null;
  equipo: Equipo | null;
  eppId: number | null;
  epp: Epp | null;
  bienId: number | null;
  bien: Bien | null;
  tipoDestino: TipoDestino;
  bomberoId: number | null;
  bombero: Bombero | null;
  vehiculoId: number | null;
  vehiculo: Vehiculo | null;
  ubicacionId: number | null;
  ubicacion: Ubicacion | null;
  compartimientoId: number | null;
  compartimiento: Compartimiento | null;
  fechaAsignacion: string;
  fechaFin: string | null;
  fechaDevolucion: string | null;
  estado: EstadoAsignacion;
  observaciones: string | null;
  activo: boolean;
}

export interface CrearAsignacionRequest {
  equipoId: number | null;
  eppId: number | null;
  bienId: number | null;
  tipoDestino: TipoDestino;
  bomberoId: number | null;
  vehiculoId: number | null;
  ubicacionId: number | null;
  compartimientoId: number | null;
  fechaAsignacion: string;
  fechaFin: string | null;
  observaciones: string | null;
}

export interface DevolverAsignacionRequest {
  fechaDevolucion?: string;
  observaciones?: string;
}

// ==================== HELPERS ====================

export function formatearEstadoAsignacion(estado: EstadoAsignacion): string {
  return estado.charAt(0) + estado.slice(1).toLowerCase();
}

export function getEstadoAsignacionBadgeClass(estado: EstadoAsignacion): string {
  switch (estado) {
    case 'ACTIVA': return 'bg-success text-white';
    case 'DEVUELTA': return 'bg-secondary text-white';
    case 'VENCIDA': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
}

export function getTipoRecurso(asignacion: Asignacion): TipoRecurso | null {
  if (asignacion.equipoId) return 'EQUIPO';
  if (asignacion.eppId) return 'EPP';
  if (asignacion.bienId) return 'BIEN';
  return null;
}

export function getNombreRecurso(asignacion: Asignacion): string {
  if (asignacion.equipo) return asignacion.equipo.nombreEquipo;
  if (asignacion.epp) return asignacion.epp.nombreEpp;
  if (asignacion.bien) return asignacion.bien.nombre;
  return 'N/A';
}

export function getCodigoRecurso(asignacion: Asignacion): string {
  if (asignacion.equipo) return asignacion.equipo.codigoCgbvp || asignacion.equipo.numeroSerie || 'N/A';
  if (asignacion.epp) return asignacion.epp.codigoCgbvp || asignacion.epp.numeroSerie || 'N/A';
  if (asignacion.bien) return asignacion.bien.codigoCgbvp || 'N/A';
  return 'N/A';
}

export function getNombreDestinatario(asignacion: Asignacion): string {
  if (asignacion.tipoDestino === 'BOMBERO' && asignacion.bombero) {
    return `${asignacion.bombero.nombre} ${asignacion.bombero.apellido}`;
  }
  if (asignacion.tipoDestino === 'VEHICULO' && asignacion.vehiculo) {
    return asignacion.vehiculo.nombreVehiculo;
  }
  if (asignacion.tipoDestino === 'UBICACION' && asignacion.ubicacion) {
    return asignacion.ubicacion.nombre;
  }
  return 'N/A';
}

export function getCodigoDestinatario(asignacion: Asignacion): string {
  if (asignacion.tipoDestino === 'BOMBERO' && asignacion.bombero) {
    return asignacion.bombero.codigoCgbvp;
  }
  if (asignacion.tipoDestino === 'VEHICULO' && asignacion.vehiculo) {
    return asignacion.vehiculo.codigo;
  }
  if (asignacion.tipoDestino === 'UBICACION' && asignacion.ubicacion) {
    return asignacion.ubicacion.codigo;
  }
  return 'N/A';
}

export function getCompartimientoNombre(asignacion: Asignacion): string {
  if (asignacion.compartimiento) {
    return asignacion.compartimiento.nombre;
  }
  return 'N/A';
}
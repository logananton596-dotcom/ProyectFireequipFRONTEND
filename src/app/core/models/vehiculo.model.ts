import { Ubicacion } from './ubicacion.model';

// ==================== ENUMS ====================

export type NombreVehiculo = 
  | 'RESCATE68'
  | 'CISTERNA68'
  | 'BOMBA68'
  | 'AMBULANCIA68';

export type MarcaVehiculo = 
  | 'FORD'
  | 'CHEVROLET'
  | 'TOYOTA'
  | 'NISSAN'
  | 'MERCEDES'
  | 'VOLVO'
  | 'OTRO';

export type TipoVehiculo = 
  | 'RESCATE'
  | 'AGUA'
  | 'MEDICO'
  | 'CISTERNA'
  | 'BOMBA'
  | 'AMBULANCIA'
  | 'OTRO';

export type EstadoVehiculo = 
  | 'OPERATIVO'
  | 'MANTENIMIENTO'
  | 'BAJA';

export type NombreUbicacion = 
  | 'BASE'
  | 'MANTENIMIENTO'
  | 'BAJA'
  | 'OFICINA'
  | 'GARAGE';

// ==================== CONSTANTES ====================

export const NOMBRES_VEHICULO: NombreVehiculo[] = [
  'RESCATE68',
  'CISTERNA68',
  'BOMBA68',
  'AMBULANCIA68'
];

export const MARCAS_VEHICULO: MarcaVehiculo[] = [
  'FORD',
  'CHEVROLET',
  'TOYOTA',
  'NISSAN',
  'MERCEDES',
  'VOLVO',
  'OTRO'
];

export const TIPOS_VEHICULO: TipoVehiculo[] = [
  'RESCATE',
  'AGUA',
  'MEDICO',
  'CISTERNA',
  'BOMBA',
  'AMBULANCIA',
  'OTRO'
];

export const ESTADOS_VEHICULO: EstadoVehiculo[] = [
  'OPERATIVO',
  'MANTENIMIENTO',
  'BAJA'
];

export const NOMBRES_UBICACION: NombreUbicacion[] = [
  'BASE',
  'MANTENIMIENTO',
  'BAJA',
  'OFICINA',
  'GARAGE'
];

// ==================== INTERFACE ====================

export interface Vehiculo {
  id?: number;
  codigo: string;
  nombreVehiculo: NombreVehiculo;
  placa: string;
  marca: MarcaVehiculo;
  tipoVehiculo: TipoVehiculo;
  estado: EstadoVehiculo;
  modelo?: string;
  anio?: number;
  capacidadAgua?: number;
  capacidadEspuma?: number;
  observacion?: string;
  activo: boolean;
  nombreUbicacion: NombreUbicacion;
  numeroMotor?: string;
  numeroChasis?: string;
}

// ==================== HELPERS ====================

export function formatearNombreVehiculo(nombre: NombreVehiculo): string {
  return nombre;
}

export function formatearMarcaVehiculo(marca: MarcaVehiculo): string {
  return marca.charAt(0) + marca.slice(1).toLowerCase();
}

export function formatearTipoVehiculo(tipo: TipoVehiculo): string {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

export function formatearEstadoVehiculo(estado: EstadoVehiculo): string {
  return estado.charAt(0) + estado.slice(1).toLowerCase();
}

export function getEstadoVehiculoBadgeClass(estado: EstadoVehiculo): string {
  switch (estado) {
    case 'OPERATIVO': return 'bg-success text-white';
    case 'MANTENIMIENTO': return 'bg-warning text-dark';
    case 'BAJA': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
}

export function getEstadoVehiculoBadgeClassByEstado(estado: string): string {
  switch (estado) {
    case 'OPERATIVO': return 'bg-success text-white';
    case 'MANTENIMIENTO': return 'bg-warning text-dark';
    case 'BAJA': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
}
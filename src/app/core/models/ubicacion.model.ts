export interface Ubicacion {
  id?: number;
  codigo: string;
  nombreUbicacion: NombreUbicacion;
  nombre: string;
  descripcion?: string;
  estado: EstadoUbicacion;
  observacion?: string;
  activa: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Relaciones inversas (no se envía, solo para referencia)
  casilleroId?: number;
  oficinaId?: number;
}


// ==================== ENUMS ====================

export type NombreUbicacion = 
  | 'ALMACEN_GENERAL'
  | 'ALMACEN_EPP'
  | 'ALMACEN_EQUIPOS'
  | 'OFICINA_JEFATURA'
  | 'OFICINA_SERVICIOS_GENERALES'
  | 'OFICINA_SANIDAD'
  | 'OFICINA_GUARDIA'
  | 'OFICINA_COCINA'
  | 'OFICINA_VESTIDORES'
  | 'OFICINA_BANOS'
  | 'OFICINA_AZOTEA'
  | 'OFICINA_COMEDOR'
  | 'OFICINA_SOTANO'
  | 'CASILLERO'
  | 'VEHICULO'
  | 'OTRO';

export type EstadoUbicacion = 'ACTIVA' | 'INACTIVA';

export const NOMBRES_UBICACION: NombreUbicacion[] = [
  'ALMACEN_GENERAL',
  'ALMACEN_EPP',
  'ALMACEN_EQUIPOS',
  'OFICINA_JEFATURA',
  'OFICINA_SERVICIOS_GENERALES',
  'OFICINA_SANIDAD',
  'OFICINA_GUARDIA',
  'OFICINA_COCINA',
  'OFICINA_VESTIDORES',
  'OFICINA_BANOS',
  'OFICINA_AZOTEA',
  'OFICINA_COMEDOR',
  'OFICINA_SOTANO',
  'CASILLERO',
  'VEHICULO',
  'OTRO'
];

export const ESTADOS_UBICACION: EstadoUbicacion[] = ['ACTIVA', 'INACTIVA'];

// ==================== HELPERS ====================

export function formatearNombreUbicacion(nombre: NombreUbicacion): string {
  return nombre.toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function getEstadoUbicacionBadgeClass(estado: EstadoUbicacion): string {
  return estado === 'ACTIVA' ? 'bg-success text-white' : 'bg-danger text-white';
}
export function getUbicacionDisplay(ubicacion: Ubicacion): string {
  return `${ubicacion.codigo} - ${ubicacion.nombre}`;
}
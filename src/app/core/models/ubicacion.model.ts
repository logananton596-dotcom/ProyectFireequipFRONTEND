// ==================== TIPOS ====================

export type TipoUbicacion =
  | 'PISO'
  | 'OFICINA'
  | 'CASILLERO'
  | 'VEHICULO'
  | 'COMPARTIMIENTO'
  | 'PATIO'
  | 'GARAJE'
  | 'PASILLO'
  | 'DEPOSITO'
  | 'OTRO';

// ==================== CONSTANTES ====================

export const TIPOS_UBICACION: TipoUbicacion[] = [
  'PISO',
  'OFICINA',
  'CASILLERO',
  'VEHICULO',
  'COMPARTIMIENTO',
  'PATIO',
  'GARAJE',
  'PASILLO',
  'DEPOSITO',
  'OTRO'
];

// ==================== INTERFACE ====================

export interface Ubicacion {
  id?: number;
  codigo: string;
  nombre: string;
  tipo: TipoUbicacion;
  tipoPersonalizado?: string;
  padreId?: number | null;
  padreNombre?: string;
  areaId?: number | null;
  areaNombre?: string;
  activa?: boolean;
  observacion?: string;
  createdAt?: string;
  updatedAt?: string;
  hijos?: Ubicacion[];
  bomberoAsignadoId?: number | null;
  bomberoAsignadoNombre?: string;
}

// ==================== HELPERS ====================

export function formatearTipoUbicacion(
  tipo: TipoUbicacion | string,
  tipoPersonalizado?: string
): string {
  if (tipo === 'OTRO' && tipoPersonalizado) {
    return tipoPersonalizado;
  }
  const mapa: Record<string, string> = {
    PISO: 'Piso',
    OFICINA: 'Oficina',
    CASILLERO: 'Casillero',
    VEHICULO: 'Vehículo',
    COMPARTIMIENTO: 'Compartimiento',
    PATIO: 'Patio',
    GARAJE: 'Garaje',
    PASILLO: 'Pasillo',
    DEPOSITO: 'Depósito',
    OTRO: 'Otro'
  };
  return mapa[tipo as string] ?? tipo;
}

export function getTipoUbicacionBadgeClass(tipo: TipoUbicacion | string): string {
  switch (tipo) {
    case 'PISO': return 'bg-primary text-white';
    case 'OFICINA': return 'bg-info text-dark';
    case 'CASILLERO': return 'bg-success text-white';
    case 'VEHICULO': return 'bg-warning text-dark';
    case 'COMPARTIMIENTO': return 'bg-secondary text-white';
    case 'PATIO': return 'bg-light text-dark';
    case 'GARAJE': return 'bg-dark text-white';
    case 'PASILLO': return 'bg-light text-dark';
    case 'DEPOSITO': return 'bg-secondary text-white';
    default: return 'bg-secondary text-white';
  }
}

export function getUbicacionDisplay(ubicacion: Ubicacion | null | undefined): string {
  if (!ubicacion) return '-';
  return `${ubicacion.codigo} - ${ubicacion.nombre}`;
}

/**
 * Construye la ruta completa de una ubicación (sin llamar al backend),
 * solo con el padre que ya viene en el objeto.
 */
export function construirRutaCorta(u: Ubicacion): string {
  if (u.padreNombre) {
    return `${u.padreNombre} > ${u.nombre}`;
  }
  return u.nombre;
}
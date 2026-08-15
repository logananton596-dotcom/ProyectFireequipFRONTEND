// ==================== ENUMS ====================
//Nombres de áreas disponibles
export type NombreArea = 
  | 'AREA_OPERACIONES'
  | 'AREA_SERVICIOS'
  | 'AREA_SANIDAD'
  | 'AREA_ADMINISTRACION';

// ==================== CONSTANTES ====================

export const NOMBRES_AREA: NombreArea[] = [
  'AREA_OPERACIONES',
  'AREA_SERVICIOS',
  'AREA_SANIDAD',
  'AREA_ADMINISTRACION'
];

// ==================== INTERFACE ====================

export interface Area {
  id?: number;
  nombreArea: NombreArea;
  encargado1Id: number;           // ID del bombero principal
  encargado2Id?: number;          // ID del bombero secundario
  fechaInicio: Date | string;
  fechaFin?: Date | string | null;
  observaciones?: string;
  activo: boolean;
}

// ==================== HELPERS ====================

// Formatea el nombre del área para UI
export function formatearNombreArea(nombre: NombreArea): string {
  return nombre.replace('AREA_', 'Area de ')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

// Formatea un ID de encargado para mostrar en UI

export function formatearEncargado(id: number): string {
  return `Bombero #${id}`;
}
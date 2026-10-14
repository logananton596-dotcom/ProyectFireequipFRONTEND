// ==================== INTERFACE ====================

export interface Area {
  id?: number;
  nombreArea: string;
  encargado1Id: number;           // ID del bombero principal
  encargado2Id?: number;          // ID del bombero secundario
  fechaInicio: Date | string;
  fechaFin?: Date | string | null;
  observaciones?: string;
  activo: boolean;
}

// ==================== HELPERS ====================


// Formatea un ID de encargado para mostrar en UI

export function formatearEncargado(id: number): string {
  return `Bombero #${id}`;
}
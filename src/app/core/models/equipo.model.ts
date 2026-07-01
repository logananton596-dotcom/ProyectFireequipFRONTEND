export interface Equipo {
  id?: number;
  codigoInterno: string;
  numeroSerie: string;
  nombre: string;
  area: string;
  marca?: string;
  modelo?: string;
  fechaCompra?: string;
  vidaUtilAnios?: number;
  ubicacionActual?: string;
  tipoEquipoId: number;
  tipoEquipoNombre?: string;
  estadoEquipoNombre?: string;
  motivoBaja?: string;
  autorizadoPor?: string;
  fechaBaja?: string;
  areaId: number;
  areaNombre?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TipoEquipo {
  id: number;
  nombre: string;
}

export interface EstadoEquipo {
  id: number;
  nombre: string;
}
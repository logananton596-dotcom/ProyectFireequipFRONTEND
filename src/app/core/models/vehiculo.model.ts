// ==================== ENUMS ====================

export type TipoVehiculo =
  // Contra incendios
  | 'AUTOBOMBA'
  | 'CISTERNA'
  // Rescate y salvamento
  | 'RESCATE'
  | 'UNIDAD_LIGERA'
  // Emergencias médicas
  | 'AMBULANCIA'
  // Coordinación y mando
  | 'COMANDO'
  // Otros
  | 'TRANSPORTE_PERSONAL'
  | 'MATERIALES_PELIGROSOS';

export type EstadoVehiculo =
  | 'OPERATIVO'
  | 'MANTENIMIENTO'
  | 'FUERA_DE_SERVICIO'
  | 'BAJA';

export type TipoCombustible =
  | 'DIESEL'
  | 'GASOLINA'
  | 'GLP'
  | 'GNC'
  | 'ELECTRICO'
  | 'MIXTO';

export type TipoLlanta =
  | 'RADIAL'
  | 'DIAGONAL';

// ==================== CONSTANTES ====================

export const TIPOS_VEHICULO: TipoVehiculo[] = [
  'AUTOBOMBA',
  'CISTERNA',
  'RESCATE',
  'UNIDAD_LIGERA',
  'AMBULANCIA',
  'COMANDO',
  'TRANSPORTE_PERSONAL',
  'MATERIALES_PELIGROSOS'
];

export const ESTADOS_VEHICULO: EstadoVehiculo[] = [
  'OPERATIVO',
  'MANTENIMIENTO',
  'FUERA_DE_SERVICIO',
  'BAJA'
];

export const TIPOS_COMBUSTIBLE: TipoCombustible[] = [
  'DIESEL',
  'GASOLINA',
  'GLP',
  'GNC',
  'ELECTRICO',
  'MIXTO'
];

export const TIPOS_LLANTA: TipoLlanta[] = [
  'RADIAL',
  'DIAGONAL'
];

// ==================== INTERFACE ====================

export interface Vehiculo {
  id?: number;

  // Identificación
  codigo: string;
  nombreVehiculo: string;
  placa?: string;
  marca: string;
  modelo?: string;
  anio?: number;
  tipoVehiculo: TipoVehiculo;
  estado: EstadoVehiculo;
  numeroMotor?: string;
  numeroChasis?: string;
  observacion?: string;
  activo?: boolean;

  // Capacidades
  capacidadAguaLitros?: number;
  capacidadCombustibleGalones?: number;

  // Combustible y aceite
  tipoCombustible?: TipoCombustible;
  tipoAceite?: string;
  intervaloCambioAceiteKm?: number;

  // Llantas
  marcaLlanta?: string;
  medidaLlanta?: string;
  tamanoAro?: string;
  tipoLlanta?: TipoLlanta;
  presionLlanta?: string;

  // Batería
  tipoBateria?: string;
  marcaBateria?: string;
  amperajeBateria?: string;
  numeroPlacasBateria?: number;

  // Documentación legal
  soatVigencia?: Date | string | null;
  revisionTecnicaVigencia?: Date | string | null;

  // Servicio
  tiempoServicioAnios?: number;
  fechaIncorporacion?: Date | string | null;

  // Ubicación
  ubicacionNodoId: number;
  ubicacionNodoNombre?: string;
  ubicacionNodoCodigo?: string;
}

// ==================== HELPERS ====================

export function formatearTipoVehiculo(tipo: TipoVehiculo): string {
  return tipo.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function formatearEstadoVehiculo(estado: EstadoVehiculo): string {
  return estado.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function formatearTipoCombustible(tipo: TipoCombustible): string {
  return tipo.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function formatearTipoLlanta(tipo: TipoLlanta): string {
  return tipo.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

export function getEstadoVehiculoBadgeClass(estado: EstadoVehiculo): string {
  switch (estado) {
    case 'OPERATIVO': return 'bg-success text-white';
    case 'MANTENIMIENTO': return 'bg-warning text-dark';
    case 'FUERA_DE_SERVICIO': return 'bg-secondary text-white';
    case 'BAJA': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
}

export function esVehiculoContraIncendio(tipo: TipoVehiculo): boolean {
  return tipo === 'AUTOBOMBA' || tipo === 'CISTERNA';
}

export function getUbicacionNodoDisplay(v: Vehiculo): string {
  if (!v.ubicacionNodoNombre) return '-';
  if (v.ubicacionNodoCodigo) {
    return `${v.ubicacionNodoCodigo} - ${v.ubicacionNodoNombre}`;
  }
  return v.ubicacionNodoNombre;
}
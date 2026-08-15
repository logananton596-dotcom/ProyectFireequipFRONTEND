import { CompaniaBombero } from './bombero.model';
import { NombreArea } from './area.model';
// ==================== ENUMS ====================
export type NombreEquipo = 
// Estructural
| 'MOTOSIERRA'
| 'MOTOBOMBA'
| 'ESCALERA_COLESCOPICA'
| 'ESCALERA_GANCHOS'
| 'GENERADOR_ELECTRICO'
| 'TURBOVENTILADOR'
| 'TRÍPODE_ILUMINACIÓN'
| 'EQUIPO_SCBA'
| 'COMPRESOR_AIRE'
| 'MANGUERA_ALTA_PRESIÓN'
| 'PITORRO_NEBLINA'
| 'GEMELA_DIVISORA'
// Forestal
| 'BOMBA_FORESTAL'
| 'PULASKI'
| 'BATIDOR'
| 'RASTRILLO_MCLEOD'
| 'MOCHILA_EXTINTORA'
| 'ANTORCHA_GOTEO'
| 'MOTOAMOLADORA'
| 'SOPLADORA_FORESTAL'
// MATPEL
| 'DETECTOR_GASES'
| 'KIT_MATPEL_TAPONAMIENTO'
| 'KIT_MATPEL_ABSORBENTE'
| 'PISCINA_DECONTAMINACION'
| 'DUCHA_PORTATIL'
| 'VENTILADOR_INTRINSECO'
| 'BOMBA_TRASVASE'
| 'LINEA_TIERRA'
// Rescate
| 'EXPANSOR'
| 'CORTADORA'
| 'RAM'
| 'CENTRAL_HIDRAULICA'
| 'COJÍN_ELEVADOR'
| 'ESTABILIZADOR_VEHICULAR'
| 'TRÍPODE_RESCATE'
| 'POLIPASTO'
| 'PUNTAL_TELESCÓPICO'
| 'CAMILLA_SKED'
| 'CAMILLA_CANASTILLA'
// Bienes
| 'COMPUTADORA'
| 'IMPRESORA'
| 'PROYECTOR'
| 'ESCRITORIO'
| 'SABANA_TERMICA'
| 'TELEVISOR_SALA'
| 'REFRIGERADORA'
| 'SISTEMA_RADIO_BASE'
| 'RADIO_PORTATIL'
| 'EQUIPO_SONIDO';

export type TipoEquipo = 
  | 'ESTRUCTURAL'
  | 'FORESTAL'
  | 'MATPEL'
  | 'RESCATE'
  | 'BIEN_GENERAL';

export type TipoInventario = 'INDIVIDUAL' | 'MULTIPLE';

export type EstadoEquipo = 'OPERATIVO' | 'MANTENIMIENTO' | 'BAJA';

// ==================== CONSTANTES ====================

export const NOMBRES_EQUIPO: NombreEquipo[] = [
'MOTOBOMBA','MOTOSIERRA','ESCALERA_COLESCOPICA','ESCALERA_GANCHOS',
'GENERADOR_ELECTRICO','TURBOVENTILADOR','TRÍPODE_ILUMINACIÓN','EQUIPO_SCBA',
'COMPRESOR_AIRE','MANGUERA_ALTA_PRESIÓN','PITORRO_NEBLINA','GEMELA_DIVISORA',
'BOMBA_FORESTAL','PULASKI','BATIDOR','RASTRILLO_MCLEOD','MOCHILA_EXTINTORA',
'ANTORCHA_GOTEO','MOTOAMOLADORA','SOPLADORA_FORESTAL','DETECTOR_GASES',
'KIT_MATPEL_TAPONAMIENTO','KIT_MATPEL_ABSORBENTE','PISCINA_DECONTAMINACION',
'DUCHA_PORTATIL','VENTILADOR_INTRINSECO','BOMBA_TRASVASE','LINEA_TIERRA','EXPANSOR',
'CORTADORA','RAM','CENTRAL_HIDRAULICA','COJÍN_ELEVADOR','ESTABILIZADOR_VEHICULAR',
'TRÍPODE_RESCATE','POLIPASTO','PUNTAL_TELESCÓPICO','CAMILLA_SKED','CAMILLA_CANASTILLA',
'COMPUTADORA','IMPRESORA','PROYECTOR','ESCRITORIO','SABANA_TERMICA','TELEVISOR_SALA',
'REFRIGERADORA','SISTEMA_RADIO_BASE','RADIO_PORTATIL','EQUIPO_SONIDO'
];

export const TIPOS_EQUIPO: TipoEquipo[] = [
  'ESTRUCTURAL', 'FORESTAL', 'MATPEL', 'RESCATE', 'BIEN_GENERAL'
];

export const TIPOS_INVENTARIO: TipoInventario[] = ['INDIVIDUAL', 'MULTIPLE'];

export const ESTADOS_EQUIPO: EstadoEquipo[] = ['OPERATIVO', 'MANTENIMIENTO', 'BAJA'];

// ==================== INTERFACE ====================

export interface Equipo {
  id?: number;
  codigoCgbvp: string;
  numeroSerie: string;
  nombreEquipo: NombreEquipo;
  tipoEquipo: TipoEquipo;
  tipoInventario: TipoInventario;
  compania: CompaniaBombero; 
  estado: EstadoEquipo;
  fechaIncorporacion: Date | string;
  vidaUtilAnios: number;
  fechaBaja?: Date | string | null;
  motivoBaja?: string | null;
  stock: number;
  stockMinimo: number;
  especificacion?: string;
  material?: string;
  marca?: string;
  modelo?: string;
  color?: string;
  observaciones?: string;
  nombreArea: NombreArea;
  ubicacionId?: number;
  asignado: boolean;
}

// ==================== HELPERS ====================

export function formatearNombreEquipo(nombre: NombreEquipo): string {
  return nombre.toLowerCase().replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function formatearTipoEquipo(tipo: TipoEquipo): string {
  return tipo.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function formatearTipoInventario(tipo: TipoInventario): string {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

export function formatearEstadoEquipo(estado: EstadoEquipo): string {
  return estado.toLowerCase().replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function getEstadoEquipoBadgeClass(estado: EstadoEquipo): string {
  switch (estado) {
    case 'OPERATIVO': return 'bg-success text-white';
    case 'MANTENIMIENTO': return 'bg-warning text-dark';
    case 'BAJA': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
}
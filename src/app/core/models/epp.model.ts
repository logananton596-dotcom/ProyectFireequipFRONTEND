import { CompaniaBombero } from './bombero.model';
// ==================== ENUMS ====================

export type TipoEpp = 
  | 'ESTRUCTURAL'
  | 'FORESTAL'
  | 'MATPEL'
  | 'RESCATE'
  | 'UNIFORME'
  | 'OTRO';

export type NombreEpp = 
  // --- ESTRUCTURAL ---
 | 'CASCO_ESTRUCTURAL'
 | 'CHAQUETA_ESTRUCTURAL' // Chaquetón de bombero
 | 'PANTALON_ESTRUCTURAL'
 | 'GUANTES_ESTRUCTURALES'
 | 'BOTAS_ESTRUCTURALES'
 | 'MONJITA_ESTRUCTURAL' // Capucha esclava ignífuga (Balaclava)
 |'MASCARA_SCBA'     // Máscara facial del equipo de respiración autónoma

  // --- FORESTAL ---
 | 'CASCO_FORESTAL'
 | 'CHAQUETA_FORESTAL'   // Camisola ignífuga forestal
 | 'PANTALON_FORESTAL'
 | 'GUANTES_FORESTALES'
 | 'BOTAS_FORESTALES'
 |'GAFAS_FORESTALES'     // Antiparras con ventilación para humo
 | 'MASCARILLA_FORESTAL'  // Filtro de partículas / pañuelo ignífugo

  // --- MATPEL (Materiales Peligrosos) ---
 | 'TRAJE_ENCAPSULADO_NIVEL_A' // Protección máxima hermética a gases
 | 'TRAJE_NIVEL_B'            // Protección contra salpicaduras químicas con SCBA externo
 | 'TRAJE_NIVEL_C'            // Protección contra salpicaduras químicas con máscara de filtro
 | 'GUANTES_QUIMICOS'          // Guantes de nitrilo, butilo o vitón de alta resistencia
 | 'BOTAS_QUIMICAS'           // Botas de caucho resistente a químicos y peligro eléctrico
 | 'FILTRO_MATPEL'           // Cartucho de protección respiratoria específico para gases/vapores

  // --- RESCATE ---
 | 'CASCO_RESCATE'
 | 'CHAQUETA_RESCATE'          // Chaqueta técnica de rescate vehicular / USAR
 | 'PANTALON_RESCATE'
 | 'GUANTES_RESCATE'           // Guantes de extricación / mecánicos con protección a cortes
 | 'BOTAS_RESCATE'             // Calzado técnico de rescate, ligero y con puntera
 | 'ARNES_DE_SEGURIDAD'        // Arnés integral de rescate vertical / altura
 | 'CUERDA_ESTATICA'
 | 'CUERDA_DINAMICA'
 | 'MOSQUETON_DE_SEGURIDAD'
 | 'CHALECO_SALVAVIDAS'        // EPP específico para rescate acuático

  // --- UNIFORME ---
 | 'GORRA_FAENA'
 | 'CAMISA_FAENA'
 | 'PANTALON_FAENA'
 | 'CALZADO_DIARIO'           // Borceguíes o botas de cuartel
 | 'CHALECO_REFLECTANTE'       // Chaleco de alta visibilidad para tránsito y operaciones

  // --- OTRO / MULTIPROPÓSITO ---
 | 'GAFAS_DE_SEGURIDAD'
 | 'MASCARILLA_FILTRANTE'
 | 'PROTECTOR_AUDITIVO'
 | 'OTRO_EPP';

export type EstadoEpp = 
  | 'OPERATIVO'
  | 'MANTENIMIENTO'
  | 'BAJA';

// ==================== CONSTANTES ====================

export const TIPOS_EPP: TipoEpp[] = [
  'ESTRUCTURAL',
  'FORESTAL',
  'MATPEL',
  'RESCATE',
  'UNIFORME',
  'OTRO'
];

export const NOMBRES_EPP: NombreEpp[] = [
  // --- ESTRUCTURAL ---
  'CASCO_ESTRUCTURAL',
  'CHAQUETA_ESTRUCTURAL', 
  'PANTALON_ESTRUCTURAL',
  'GUANTES_ESTRUCTURALES',
  'BOTAS_ESTRUCTURALES',
  'MONJITA_ESTRUCTURAL',  // Capucha esclava ignífuga (Balaclava)
  'MASCARA_SCBA',         // Máscara facial del equipo de respiración autónoma

  // --- FORESTAL ---
  'CASCO_FORESTAL',
  'CHAQUETA_FORESTAL',    // Camisola ignífuga forestal
  'PANTALON_FORESTAL',
  'GUANTES_FORESTALES',
  'BOTAS_FORESTALES',
  'GAFAS_FORESTALES',     // Antiparras con ventilación para humo
  'MASCARILLA_FORESTAL',  // Filtro de partículas / pañuelo ignífugo

  // --- MATPEL (Materiales Peligrosos) ---
  'TRAJE_ENCAPSULADO_NIVEL_A', // Protección máxima hermética a gases
  'TRAJE_NIVEL_B',             // Protección contra salpicaduras químicas con SCBA externo
  'TRAJE_NIVEL_C',             // Protección contra salpicaduras químicas con máscara de filtro
  'GUANTES_QUIMICOS',          // Guantes de nitrilo, butilo o vitón de alta resistencia
  'BOTAS_QUIMICAS',            // Botas de caucho resistente a químicos y peligro eléctrico
  'FILTRO_MATPEL',             // Cartucho de protección respiratoria específico para gases/vapores

  // --- RESCATE ---
  'CASCO_RESCATE',
  'CHAQUETA_RESCATE',          // Chaqueta técnica de rescate vehicular / USAR
  'PANTALON_RESCATE',
  'GUANTES_RESCATE',           // Guantes de extricación / mecánicos con protección a cortes
  'BOTAS_RESCATE',             // Calzado técnico de rescate, ligero y con puntera
  'ARNES_DE_SEGURIDAD',        // Arnés integral de rescate vertical / altura
  'CUERDA_ESTATICA',
  'CUERDA_DINAMICA',
  'MOSQUETON_DE_SEGURIDAD',
  'CHALECO_SALVAVIDAS',        // EPP específico para rescate acuático

  // --- UNIFORME ---
  'GORRA_FAENA',
  'CAMISA_FAENA',
  'PANTALON_FAENA',
  'CALZADO_DIARIO',            // Borceguíes o botas de cuartel
  'CHALECO_REFLECTANTE',       // Chaleco de alta visibilidad para tránsito y operaciones

  // --- OTRO / MULTIPROPÓSITO ---
  'GAFAS_DE_SEGURIDAD',
  'MASCARILLA_FILTRANTE',
  'PROTECTOR_AUDITIVO',
  'OTRO_EPP'
];

export const ESTADOS_EPP: EstadoEpp[] = [
  'OPERATIVO',
  'MANTENIMIENTO',
  'BAJA'
];


// ==================== INTERFACE ====================

export interface Epp {
  id?: number;
  codigoCgbvp: string;
  numeroSerie: string;
  tipoEpp: TipoEpp;
  nombreEpp: NombreEpp;
  compania: CompaniaBombero; // Importado de bombero.model
  areaId: number;
  areaNombre?: string; 
  ubicacionId?: number; 
  fechaIncorporacion: Date | string;
  vidaUtilAnios: number;
  estado: EstadoEpp;
  fechaBaja?: Date | string | null;
  motivoBaja?: string | null;
  talla?: string;
  material?: string;
  marca?: string;
  color?: string;
  observaciones?: string;
  asignado: boolean; // Solo lectura, lo modifica Asignaciones
}

// ==================== HELPERS ====================

export function formatearTipoEpp(tipo: TipoEpp): string {
  return tipo.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function formatearNombreEpp(nombre: NombreEpp): string {
  return nombre.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letra) => letra.toUpperCase());
}


export function formatearEstadoEpp(estado: EstadoEpp): string {
  return estado.toLowerCase().replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function getEstadoEppBadgeClass(estado: EstadoEpp): string {
  switch (estado) {
    case 'OPERATIVO': return 'bg-success text-white';
    case 'MANTENIMIENTO': return 'bg-warning text-dark';
    case 'BAJA': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
}

export function esEppValido(epp: Partial<Epp>): epp is Epp {
  return !!(
    epp.codigoCgbvp &&
    epp.numeroSerie &&
    epp.tipoEpp &&
    epp.nombreEpp &&
    epp.compania &&
    epp.areaId &&
    epp.areaNombre &&
    epp.fechaIncorporacion &&
    epp.vidaUtilAnios &&
    epp.estado !== undefined
  );
}
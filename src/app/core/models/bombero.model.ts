export interface Bombero {
  id?: number;
  codigoCgbvp: string;
  compania: CompaniaBombero; // Modificado: Ahora es estricto en vez de string
  fechaIncorporacion: Date | string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: Date | string;
  tipoSangre: TipoSangre; 
  talla: number;          
  peso: number;           
  grado: GradoBombero;
  telefono?: string;
  telefonoEmergencia?: string;
  correo: string; 
  estado: EstadoBombero;
  motivoEstado?: string | null; 
  
  licencia: boolean;   
  // Datos de conducción (Se agregaron al modelo)
  tipoLicencia: TipoLicencia;
  tipoVehiculoLicencia: TipoVehiculoLicencia;

  limitacionSalud: string;    

  // Datos de Cargo (Modificados a opcionales para evitar fallos si tieneCargo es false)
  tieneCargo: boolean;             
  tipoCargo: TipoCargo;            
  fechaInicioCargo?: Date | string | null;  
  fechaFinCargo?: Date | string | null;     
}

export type EstadoBombero = 'ACTIVO' | 'RESERVA' | 'BAJA';

// Grados actualizados según el escalafón oficial del CGBVP
export type GradoBombero = 
  | 'POSTULANTE' 
  | 'SECCIONARIO' 
  | 'SUBTENIENTE' 
  | 'TENIENTE'
  | 'CAPITAN'
  | 'TENIENTE_BRIGADIER'
  | 'BRIGADIER'
  | 'BRIGADIER_MAYOR';

export type TipoSangre = 'O_POSITIVO' | 'O_NEGATIVO' | 'A_POSITIVO' | 'A_NEGATIVO' | 'B_POSITIVO' | 'B_NEGATIVO' | 'AB_POSITIVO' | 'AB_NEGATIVO';

export type TipoCargo = 'NINGUNO' | 'PRIMER_JEFE' | 'SEGUNDO_JEFE' | 'JEFE_DE_SERVICIOS' | 'JEFE_DE_OPERACIONES' | 'JEFE_DE_ADMINISTRACION' | 'JEFE_DE_IMAGEN' | 'JEFE_DE_SANIDAD';

// Corregido el error de dedo en la minúscula de b69
export type CompaniaBombero = 'B68_ABANCAY'; 

export type TipoVehiculoLicencia = 'NINGUNO' | 'MOTOCICLETA' | 'VEHICULO_LIGERO' | 'VEHICULO_PESADO';

// Clases de licencias válidas en Perú (MTC)
export type TipoLicencia = 'AI' | 'AIIa' | 'AIIb' | 'AIIIa' | 'AIIIb' | 'AIIIc' | 'BIIa' | 'BIIb' | 'BIIc' | 'NINGUNO';

// --- ARRAYS PARA SELECTORES (COMBOS) EN FORMULARIOS ---
export const ESTADOS_BOMBERO: EstadoBombero[] = ['ACTIVO', 'RESERVA', 'BAJA'];
export const GRADOS_BOMBERO: GradoBombero[] = ['POSTULANTE', 'SECCIONARIO', 'SUBTENIENTE', 'TENIENTE', 'CAPITAN', 'TENIENTE_BRIGADIER', 'BRIGADIER', 'BRIGADIER_MAYOR'];
export const TIPOS_SANGRE: TipoSangre[] = ['O_POSITIVO', 'O_NEGATIVO', 'A_POSITIVO', 'A_NEGATIVO', 'B_POSITIVO', 'B_NEGATIVO', 'AB_POSITIVO', 'AB_NEGATIVO'];
export const TIPOS_CARGO: TipoCargo[] = ['NINGUNO', 'PRIMER_JEFE', 'SEGUNDO_JEFE', 'JEFE_DE_SERVICIOS', 'JEFE_DE_OPERACIONES', 'JEFE_DE_ADMINISTRACION', 'JEFE_DE_IMAGEN', 'JEFE_DE_SANIDAD'];
export const COMPANIAS_BOMBERO: CompaniaBombero[] = ['B68_ABANCAY'];
export const TIPOS_VEHICULO_LICENCIA: TipoVehiculoLicencia[] = ['NINGUNO', 'MOTOCICLETA', 'VEHICULO_LIGERO', 'VEHICULO_PESADO'];
export const TIPOS_LICENCIA: TipoLicencia[] = ['AI', 'AIIa', 'AIIb', 'AIIIa', 'AIIIb', 'AIIIc', 'NINGUNO'];

// --- HELPERS PARA UI ---
export function formatearTipoSangre(tipo: TipoSangre): string {
  return tipo.includes('POSITIVO') ? tipo.replace('_POSITIVO', ' +') : tipo.replace('_NEGATIVO', ' -');
} 

export function formatearCompania(compania: CompaniaBombero): string {
  return compania.replace(/_/g, ' ').replace('B', 'B-');
}

export function formatearTipoVehiculo(tipo: TipoVehiculoLicencia): string {
  return tipo === 'NINGUNO' ? 'Ninguno' : tipo.replace('_', ' ').toLowerCase();
}
export function formatearTipoLicencia(tipo: TipoLicencia): string {
  return tipo === 'NINGUNO' ? 'Ninguno' : tipo;
}


// --- FUNCIÓN DE VALIDACIÓN CORREGIDA ---
export function esBomberoValido(bombero: Partial<Bombero>): bombero is Bombero {
  return !!(
    bombero.codigoCgbvp &&
    bombero.compania &&
    bombero.fechaIncorporacion &&
    bombero.nombre &&
    bombero.apellido &&
    bombero.dni &&
    bombero.fechaNacimiento &&
    bombero.grado &&
    bombero.estado &&
    bombero.tipoSangre &&
    bombero.tipoLicencia &&
    bombero.tipoVehiculoLicencia &&
    bombero.talla !== undefined &&
    bombero.peso !== undefined &&
    bombero.tieneCargo !== undefined &&
    bombero.tipoCargo !== undefined
  );
}
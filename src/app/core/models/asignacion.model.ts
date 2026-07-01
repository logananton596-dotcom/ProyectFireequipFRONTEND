export interface AsignacionEquipo {
  id?: number;
  equipoId: number;
  bomberoId: number;
  // Datos informativos (vienen del backend)
  equipoCodigoInterno?: string;
  equipoNumeroSerie?: string;
  equipoNombre?: string;
  tipoEquipoNombre?: string;
  equipoMarca?: string;
  bomberoCodigo?: string;
  bomberoNombre?: string;
  bomberoGrado?: string;
  // Especificaciones de la entrega
  tallaEquipo?: string;
  caracteristicasEspecificas?: string;
  fechaPuestaOperatividad?: string;
  fechaCaducidad?: string;
  estadoFisicoEntrega: string;
  tipoMovimiento: string;
  // Responsable
  responsableNombre: string;
  responsableCodigo: string;
  responsableGrado?: string;
  responsableCargo?: string;
  responsableTelefono?: string;
  // Auditoría
  fechaHoraCreacion?: string;
  fechaHoraActualizacion?: string;
  fechaHoraUltimoMovimiento?: string;
  fechaHoraDevolucion?: string;
  fechaHoraEntrega?: string;
}
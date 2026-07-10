export interface Mantenimiento {
  id?: number;
  equipoId: number;
  equipoCodigoInterno?: string;
  equipoNombre?: string;
  equipoMarca?: string;
  fecha: string;          // LocalDate - fecha del mantenimiento
  tipo: 'PREVENTIVO' | 'CORRECTIVO';
  descripcion: string;
  responsable: string;
  fechaProximo?: string;  // LocalDate - próxima revisión
  fechaFin?: string;      // LocalDate - fecha de finalización
}
export interface Mantenimiento {
  id?: number;
  equipoId: number;
  equipoCodigoInterno?: string;
  equipoNombre?: string;
  equipoMarca?: string;
  fecha: string;
  tipo: 'PREVENTIVO' | 'CORRECTIVO';
  descripcion: string;
  responsable: string;
  fechaProximo?: string;
  fechaFin?: string;
}
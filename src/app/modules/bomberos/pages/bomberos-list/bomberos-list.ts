import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Bombero, EstadoBombero, formatearTipoLicencia, formatearTipoSangre, formatearTipoVehiculo, GradoBombero, formatearCompania, ESTADOS_BOMBERO } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ModalMotivoComponent } from '../../components/modal-motivo/modal-motivo.component';


@Component({
  selector: 'app-bomberos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ModalMotivoComponent ],
  templateUrl: './bomberos-list.html',
  styleUrls: ['./bomberos-list.css']
})
export class BomberosList implements OnInit, OnDestroy {
  private bomberoService = inject(BomberoService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);


  private bomberosSignal = signal<Bombero[]>([]);
  loading = false;
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];
  formatearCompania = formatearCompania;
  formatearTipoVehiculo = formatearTipoVehiculo;
  formatearTipoLicencia = formatearTipoLicencia;
  estadosDisponibles = ESTADOS_BOMBERO;
  modalAbierto = signal<boolean>(false);

    // Referencia al modal hijo
  @ViewChild(ModalMotivoComponent) modalMotivo!: ModalMotivoComponent;
  // Variables para controlar el flujo de cambio de estado
  private bomberoSeleccionado: Bombero | null = null;
  private nuevoEstadoSeleccionado: string = '';


  // Filtro mejorado con nuevos campos
  filteredBomberos = computed<Bombero[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const listaOriginal = this.bomberosSignal();

    if (!term) return listaOriginal;

    return listaOriginal.filter(bombero => 
      (bombero.nombre && bombero.nombre.toLowerCase().includes(term)) ||
      (bombero.apellido && bombero.apellido.toLowerCase().includes(term)) ||
      (bombero.codigoCgbvp && bombero.codigoCgbvp.toLowerCase().includes(term)) ||
      (bombero.compania && bombero.compania.toLowerCase().includes(term)) ||
      (bombero.dni && bombero.dni.includes(term)) ||
      (bombero.grado && bombero.grado.toLowerCase().includes(term)) ||
      (bombero.estado && bombero.estado.toLowerCase().includes(term))||
      (bombero.tipoSangre && bombero.tipoSangre.toLowerCase().includes(term)) || 
      (bombero.talla && bombero.talla.toString().includes(term)) || 
      (bombero.peso && bombero.peso.toString().includes(term)) ||
      (bombero.tieneCargo !== undefined && bombero.tieneCargo.toString().includes(term)) ||
      (bombero.tipoCargo && bombero.tipoCargo.toLowerCase().includes(term)) ||
      (bombero.telefono && bombero.telefono.includes(term)) ||
      (bombero.correo && bombero.correo.toLowerCase().includes(term)) ||
      (bombero.limitacionSalud && bombero.limitacionSalud.toLowerCase().includes(term)) ||
      (bombero.tipoLicencia && bombero.tipoLicencia.toLowerCase().includes(term)) ||
      (bombero.tipoVehiculoLicencia && bombero.tipoVehiculoLicencia.toLowerCase().includes(term))
    );
  });

  bomberosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredBomberos().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredBomberos().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  ngOnInit(): void {
    this.loadBomberos();
  }

  loadBomberos(): void {
    this.loading = true;
    this.subscriptions.add(
      this.bomberoService.getAll().subscribe({
        next: (data) => {
          this.bomberosSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error cargando bomberos:', error);
          this.toastr.error('Error al cargar la lista de personal', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
      this.cdRef.detectChanges();
    }
  }

  onTamanoPaginaChange(nuevoTamano: number): void {
    this.tamanoPagina.set(Number(nuevoTamano));
    this.paginaActual.set(1);
    this.cdRef.detectChanges();
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.paginaActual.set(1);
    this.cdRef.detectChanges();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/bomberos', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/bomberos', id, 'editar']);
  }

  eliminar(id: number, nombreCompleto: string): void {
    if (confirm(`¿Está seguro de eliminar al bombero "${nombreCompleto}"?`)) {
      this.subscriptions.add(
        this.bomberoService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Bombero eliminado correctamente', 'Éxito');
            this.loadBomberos();
          },
          error: (error) => {
            console.error('Error de eliminación:', error);
            this.toastr.error('No se pudo eliminar el registro (Trazabilidad activa)', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  //Método para cambiar estado desde la lista
  cambiarEstadoLista(bombero: Bombero, nuevoEstado: string): void {
    // Si es el mismo estado, no hacer nada
    if (bombero.estado === nuevoEstado) return;
    // Guardar el bombero y el nuevo estado para usarlos después
    this.bomberoSeleccionado = bombero;
    this.nuevoEstadoSeleccionado = nuevoEstado;
    
    // Si selecciona ACTIVO, cambiar directamente sin modal
    if (nuevoEstado === 'ACTIVO') {
      this.confirmarCambioEstado(bombero.id!, nuevoEstado);
      return;
    }
    
    this.modalAbierto.set(true);
    // Para RESERVA o BAJA, mostrar modal
    this.modalMotivo.titulo = nuevoEstado === 'RESERVA' ? 'Motivo de Reserva' : 'Motivo de Baja';
    this.modalMotivo.estado = nuevoEstado;
    this.modalMotivo.abrir();
    
  }
    //Método que recibe el motivo desde el modal hijo
    //Se ejecuta cuando el usuario confirma el motivo en el modal
  onMotivoConfirmado(motivo: string): void {

    this.modalAbierto.set(false);
    if (this.bomberoSeleccionado && this.nuevoEstadoSeleccionado) {
      this.confirmarCambioEstado(
        this.bomberoSeleccionado.id!,
        this.nuevoEstadoSeleccionado,
        motivo
      );
      // Limpiar variables
      this.bomberoSeleccionado = null;
      this.nuevoEstadoSeleccionado = '';
      
    }
  }
  // 5. AGREGA EL MÉTODO DE CANCELACIÓN (Por si cierran el modal con la X o Cancelar)
  onMotivoCancelado(): void {
    // 6. Apagamos el signal para descongelar la tabla principal
    this.modalAbierto.set(false);
    this.bomberoSeleccionado = null;
    this.nuevoEstadoSeleccionado = '';
  }

    //Método privado que ejecuta la petición HTTP para cambiar el estado
  private confirmarCambioEstado(id: number, nuevoEstado: string, motivo?: string): void {
    this.subscriptions.add(
      this.bomberoService.cambiarEstado(id, nuevoEstado as EstadoBombero, motivo).subscribe({
        next: () => {
          this.toastr.success(`Estado actualizado a ${nuevoEstado}`, 'Éxito');
          this.loadBomberos();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
        }
      })
    );
  }



  // Método actualizado para usar EstadoBombero
  getEstadoBadgeClass(estado: EstadoBombero): string {
    switch (estado) {
      case 'ACTIVO': return 'bg-success text-white';
      case 'RESERVA': return 'bg-warning text-dark';
      case 'BAJA': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  // Helper para mostrar nombre completo
  getNombreCompleto(bombero: Bombero): string {
    return `${bombero.apellido}, ${bombero.nombre}`;
  }
  // Helper para formatear tipo de sangre
  formatearTipoSangre = formatearTipoSangre;
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
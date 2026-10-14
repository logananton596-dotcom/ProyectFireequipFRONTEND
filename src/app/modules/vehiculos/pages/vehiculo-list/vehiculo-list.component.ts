import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import { 
  Vehiculo, 
  formatearNombreVehiculo, 
  formatearMarcaVehiculo,
  formatearTipoVehiculo,
  formatearEstadoVehiculo,
  getEstadoVehiculoBadgeClass,
  EstadoVehiculo
} from '../../../../core/models/vehiculo.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vehiculo-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './vehiculo-list.component.html',
  styleUrls: ['./vehiculo-list.component.css']
})
export class VehiculoListComponent implements OnInit, OnDestroy {
  private vehiculoService = inject(VehiculoService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  private vehiculosSignal = signal<Vehiculo[]>([]);
  loading = false;
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];

  // Helpers
  formatearNombreVehiculo = formatearNombreVehiculo;
  formatearMarcaVehiculo = formatearMarcaVehiculo;
  formatearTipoVehiculo = formatearTipoVehiculo;
  formatearEstadoVehiculo = formatearEstadoVehiculo;
  getEstadoVehiculoBadgeClass = getEstadoVehiculoBadgeClass;

  // Filtro
  filteredVehiculos = computed<Vehiculo[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const listaOriginal = this.vehiculosSignal();

    if (!term) return listaOriginal;

    return listaOriginal.filter(vehiculo =>
      (vehiculo.codigo && vehiculo.codigo.toLowerCase().includes(term)) ||
      (vehiculo.nombreVehiculo && (vehiculo.nombreVehiculo as string).toLowerCase().includes(term)) ||
      (vehiculo.placa && vehiculo.placa.toLowerCase().includes(term)) ||
      (vehiculo.marca && (vehiculo.marca as string).toLowerCase().includes(term)) ||
      (vehiculo.tipoVehiculo && (vehiculo.tipoVehiculo as string).toLowerCase().includes(term)) ||
      (vehiculo.estado && (vehiculo.estado as string).toLowerCase().includes(term)) || // 🌟 Casteo seguro
      (vehiculo.modelo && vehiculo.modelo.toLowerCase().includes(term))
    );

  });

  vehiculosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredVehiculos().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredVehiculos().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  ngOnInit(): void {
    this.loadVehiculos();
  }

  loadVehiculos(): void {
    this.loading = true;
    this.subscriptions.add(
      this.vehiculoService.getAll().subscribe({
        next: (data) => {
          this.vehiculosSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cargar vehículos', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  verDetalle(id: number): void {
    this.router.navigate(['/vehiculos', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/vehiculos', id, 'editar']);
  }

  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el vehículo "${nombre}"?`)) {
      this.subscriptions.add(
        this.vehiculoService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Vehículo eliminado correctamente', 'Éxito');
            this.loadVehiculos();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar el vehículo', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

 cambiarEstado(id: number, nombre: string, nuevoEstado: EstadoVehiculo): void {
    if (confirm(`¿Cambiar estado del vehículo "${nombre}" a ${nuevoEstado}?`)) {
      this.subscriptions.add(
        this.vehiculoService.cambiarEstado(id, nuevoEstado).subscribe({
          next: () => {
            this.toastr.success(`Estado actualizado a ${nuevoEstado}`, 'Éxito');
            this.loadVehiculos();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  // Estado badge
  getEstadoBadgeClass(estado: EstadoVehiculo): string {
    switch (estado) {
      case 'OPERATIVO': return 'bg-success text-white';
      case 'MANTENIMIENTO': return 'bg-warning text-dark';
      case 'BAJA': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
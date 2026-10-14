import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompartimientoService } from '../../../../../core/services/compartimiento.service';
import { VehiculoService } from '../../../../../core/services/vehiculo.service';
import { Compartimiento, getEstadoCompartimientoBadgeClass, formatearEstadoCompartimiento } from '../../../../../core/models/compartimiento.model';
import { Vehiculo } from '../../../../../core/models/vehiculo.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compartimientos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './compartimientos-list.component.html',
  styleUrls: ['./compartimientos-list.component.css']
})
export class CompartimientosListComponent implements OnInit, OnDestroy {
  private compartimientoService = inject(CompartimientoService);
  private vehiculoService = inject(VehiculoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  vehiculoId: number | null = null;
  vehiculo: Vehiculo | null = null;
  private compartimientosSignal = signal<Compartimiento[]>([]);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  filtroEstado = signal<string>('TODOS');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];

  // Helpers
  getEstadoCompartimientoBadgeClass = getEstadoCompartimientoBadgeClass;
  formatearEstadoCompartimiento = formatearEstadoCompartimiento;

  ngOnInit(): void {
    this.vehiculoId = Number(this.route.snapshot.paramMap.get('vehiculoId'));
    if (this.vehiculoId) {
      this.cargarVehiculo();
      this.loadCompartimientos();
    }
  }

  private cargarVehiculo(): void {
    this.subscriptions.add(
      this.vehiculoService.getById(this.vehiculoId!).subscribe({
        next: (vehiculo) => {
          this.vehiculo = vehiculo;
        },
        error: () => {
          this.toastr.error('Error cargando el vehículo', 'Error');
        }
      })
    );
  }

  loadCompartimientos(): void {
    if (!this.vehiculoId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.compartimientoService.getByVehiculo(this.vehiculoId).subscribe({
        next: (data) => {
          this.compartimientosSignal.set(data);
          this.loading.set(false);
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cargar compartimientos', 'Error');
          this.loading.set(false);
          this.cdRef.detectChanges();
        }
      })
    );
  }

  filteredCompartimientos = computed<Compartimiento[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const estado = this.filtroEstado();
    const listaOriginal = this.compartimientosSignal();

    return listaOriginal.filter(item => {
      const matchText = !term ||
        item.codigo.toLowerCase().includes(term) ||
        item.nombre.toLowerCase().includes(term);

      const matchEstado = estado === 'TODOS' ||
        (estado === 'ACTIVO' && item.activo) ||
        (estado === 'INACTIVO' && !item.activo);

      return matchText && matchEstado;
    });
  });

  compartimientosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredCompartimientos().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredCompartimientos().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  verDetalle(id: number): void {
    this.router.navigate(['/vehiculos', this.vehiculoId, 'compartimientos', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/vehiculos', this.vehiculoId, 'compartimientos', id, 'editar']);
  }

  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el compartimiento "${nombre}"?`)) {
      this.subscriptions.add(
        this.compartimientoService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Compartimiento eliminado correctamente', 'Éxito');
            this.loadCompartimientos();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar el compartimiento', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  cambiarEstado(id: number, activo: boolean, nombre: string): void {
    const nuevoEstado = activo ? 'inactivar' : 'activar';
    if (confirm(`¿${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)} el compartimiento "${nombre}"?`)) {
      this.subscriptions.add(
        this.compartimientoService.cambiarEstado(id, !activo).subscribe({
          next: () => {
            this.toastr.success(`Compartimiento ${activo ? 'inactivado' : 'activado'} correctamente`, 'Éxito');
            this.loadCompartimientos();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/vehiculos', this.vehiculoId]);
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
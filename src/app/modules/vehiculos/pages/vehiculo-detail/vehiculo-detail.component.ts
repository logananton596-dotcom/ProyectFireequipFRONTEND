import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import {
  Vehiculo,
  formatearNombreVehiculo,
  formatearMarcaVehiculo,
  formatearTipoVehiculo,
  formatearEstadoVehiculo,
  getEstadoVehiculoBadgeClass
} from '../../../../core/models/vehiculo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehiculo-detail',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './vehiculo-detail.component.html',
  styleUrls: ['./vehiculo-detail.component.css']
})
export class VehiculoDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehiculoService = inject(VehiculoService);
  private toastr = inject(ToastrService);

  vehiculo = signal<Vehiculo | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // Helpers
  formatearNombreVehiculo = formatearNombreVehiculo;
  formatearMarcaVehiculo = formatearMarcaVehiculo;
  formatearTipoVehiculo = formatearTipoVehiculo;
  formatearEstadoVehiculo = formatearEstadoVehiculo;
  getEstadoVehiculoBadgeClass = getEstadoVehiculoBadgeClass;

  ngOnInit(): void {
    this.loadVehiculo();
  }

  loadVehiculo(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/vehiculos']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.vehiculoService.getById(id).subscribe({
        next: (vehiculo) => {
          this.vehiculo.set(vehiculo);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el vehículo', 'Error');
          this.loading.set(false);
          this.router.navigate(['/vehiculos']);
        }
      })
    );
  }

  // Acciones
  editar(): void {
    const vehiculo = this.vehiculo();
    if (vehiculo?.id) {
      this.router.navigate(['/vehiculos', vehiculo.id, 'editar']);
    }
  }

  eliminar(): void {
    const vehiculo = this.vehiculo();
    if (!vehiculo) return;

    if (confirm(`¿Está seguro de eliminar el vehículo "${vehiculo.nombreVehiculo}"?`)) {
      this.subscriptions.add(
        this.vehiculoService.deleteById(vehiculo.id!).subscribe({
          next: () => {
            this.toastr.success('Vehículo eliminado correctamente', 'Éxito');
            this.router.navigate(['/vehiculos']);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando el vehículo', 'Error');
          }
        })
      );
    }
  }

  cambiarEstado(nuevoEstado: string): void {
    const vehiculo = this.vehiculo();
    if (!vehiculo) return;

    if (confirm(`¿Cambiar estado del vehículo "${vehiculo.nombreVehiculo}" a ${nuevoEstado}?`)) {
      this.subscriptions.add(
        this.vehiculoService.cambiarEstado(vehiculo.id!, nuevoEstado).subscribe({
          next: () => {
            this.toastr.success(`Estado actualizado a ${nuevoEstado}`, 'Éxito');
            this.loadVehiculo();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/vehiculos']);
  }

  // Formatear fecha
  formatFecha(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener badge de estado
  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'OPERATIVO': return 'bg-success text-white';
      case 'MANTENIMIENTO': return 'bg-warning text-dark';
      case 'BAJA': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  // Verificar si se puede cambiar estado
  puedeCambiarEstado(): boolean {
    const vehiculo = this.vehiculo();
    return vehiculo?.estado !== 'BAJA';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
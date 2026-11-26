import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import {
  Vehiculo,
  EstadoVehiculo,
  formatearTipoVehiculo,
  formatearEstadoVehiculo,
  formatearTipoCombustible,
  formatearTipoLlanta,
  getEstadoVehiculoBadgeClass,
  getUbicacionNodoDisplay
} from '../../../../core/models/vehiculo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehiculo-detail',
  standalone: true,
  imports: [CommonModule],
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
  formatearTipoVehiculo = formatearTipoVehiculo;
  formatearEstadoVehiculo = formatearEstadoVehiculo;
  formatearTipoCombustible = formatearTipoCombustible;
  formatearTipoLlanta = formatearTipoLlanta;
  getEstadoVehiculoBadgeClass = getEstadoVehiculoBadgeClass;
  getUbicacionNodoDisplay = getUbicacionNodoDisplay;

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
        next: (v) => {
          this.vehiculo.set(v);
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

  editar(): void {
    const v = this.vehiculo();
    if (v?.id) {
      this.router.navigate(['/vehiculos', v.id, 'editar']);
    }
  }

  eliminar(): void {
    const v = this.vehiculo();
    if (!v) return;

    if (confirm(`¿Está seguro de eliminar el vehículo "${v.nombreVehiculo}"?`)) {
      this.subscriptions.add(
        this.vehiculoService.deleteById(v.id!).subscribe({
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

  cambiarEstado(nuevoEstado: EstadoVehiculo): void {
    const v = this.vehiculo();
    if (!v) return;

    const etiqueta = this.formatearEstadoVehiculo(nuevoEstado);
    if (confirm(`¿Cambiar estado del vehículo "${v.nombreVehiculo}" a ${etiqueta}?`)) {
      this.subscriptions.add(
        this.vehiculoService.cambiarEstado(v.id!, nuevoEstado).subscribe({
          next: (vehiculoActualizado) => {
            this.vehiculo.set(vehiculoActualizado);
            this.toastr.success(`Estado actualizado a ${etiqueta}`, 'Éxito');
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

  formatFecha(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  puedeCambiarEstado(): boolean {
    return this.vehiculo()?.estado !== 'BAJA';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
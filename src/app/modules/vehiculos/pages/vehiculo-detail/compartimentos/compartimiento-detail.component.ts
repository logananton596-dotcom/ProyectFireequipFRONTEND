import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompartimientoService } from '../../../../../core/services/compartimiento.service';
import { VehiculoService } from '../../../../../core/services/vehiculo.service';
import { Compartimiento, getEstadoCompartimientoBadgeClass, formatearEstadoCompartimiento } from '../../../../../core/models/compartimiento.model';
import { Vehiculo } from '../../../../../core/models/vehiculo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-compartimiento-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compartimiento-detail.component.html',
  styleUrls: ['./compartimiento-detail.component.css']
})
export class CompartimientoDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private compartimientoService = inject(CompartimientoService);
  private vehiculoService = inject(VehiculoService);
  private toastr = inject(ToastrService);

  compartimiento = signal<Compartimiento | null>(null);
  vehiculo = signal<Vehiculo | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // Helpers
  getEstadoCompartimientoBadgeClass = getEstadoCompartimientoBadgeClass;
  formatearEstadoCompartimiento = formatearEstadoCompartimiento;

  ngOnInit(): void {
    this.loadCompartimiento();
  }

  loadCompartimiento(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const vehiculoId = Number(this.route.snapshot.paramMap.get('vehiculoId'));

    if (!id || !vehiculoId) {
      this.router.navigate(['/vehiculos']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.compartimientoService.getById(id).subscribe({
        next: (compartimiento) => {
          this.compartimiento.set(compartimiento);
          this.cargarVehiculo(compartimiento.vehiculoId);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el compartimiento', 'Error');
          this.loading.set(false);
          this.router.navigate(['/vehiculos', vehiculoId, 'compartimientos']);
        }
      })
    );
  }

  private cargarVehiculo(vehiculoId: number): void {
    this.subscriptions.add(
      this.vehiculoService.getById(vehiculoId).subscribe({
        next: (vehiculo) => this.vehiculo.set(vehiculo),
        error: () => this.vehiculo.set(null)
      })
    );
  }

  // Acciones
  editar(): void {
    const compartimiento = this.compartimiento();
    const vehiculoId = this.vehiculo()?.id;
    if (compartimiento?.id && vehiculoId) {
      this.router.navigate(['/vehiculos', vehiculoId, 'compartimientos', compartimiento.id, 'editar']);
    }
  }

  eliminar(): void {
    const compartimiento = this.compartimiento();
    if (!compartimiento) return;

    if (confirm(`¿Está seguro de eliminar el compartimiento "${compartimiento.nombre}"?`)) {
      this.subscriptions.add(
        this.compartimientoService.deleteById(compartimiento.id!).subscribe({
          next: () => {
            this.toastr.success('Compartimiento eliminado correctamente', 'Éxito');
            this.volver();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando el compartimiento', 'Error');
          }
        })
      );
    }
  }

  cambiarEstado(): void {
    const compartimiento = this.compartimiento();
    if (!compartimiento) return;

    const nuevoEstado = !compartimiento.activo;
    const accion = nuevoEstado ? 'activar' : 'inactivar';

    if (confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} el compartimiento "${compartimiento.nombre}"?`)) {
      this.subscriptions.add(
        this.compartimientoService.cambiarEstado(compartimiento.id!, nuevoEstado).subscribe({
          next: () => {
            this.toastr.success(`Compartimiento ${nuevoEstado ? 'activado' : 'inactivado'} correctamente`, 'Éxito');
            this.loadCompartimiento();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    const vehiculoId = this.vehiculo()?.id || Number(this.route.snapshot.paramMap.get('vehiculoId'));
    this.router.navigate(['/vehiculos', vehiculoId, 'compartimientos']);
  }

  // Obtener display del vehículo
  getVehiculoDisplay(): string {
    const v = this.vehiculo();
    if (!v) return 'N/A';
    return `${v.codigo} - ${v.nombreVehiculo}`;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
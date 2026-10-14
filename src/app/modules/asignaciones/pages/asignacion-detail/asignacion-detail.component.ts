// src/app/modules/asignaciones/pages/asignacion-detail/asignacion-detail.component.ts

import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AsignacionService } from '../../../../core/services/asignacion.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { EquipoService } from '../../../../core/services/equipo.service';
import { EppService } from '../../../../core/services/epp.service';
import { BienService } from '../../../../core/services/bien.service';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import { CompartimientoService } from '../../../../core/services/compartimiento.service';
import {
  Asignacion,
  formatearEstadoAsignacion,
  getEstadoAsignacionBadgeClass,
  getTipoRecurso,
  getNombreRecurso,
  getCodigoRecurso,
  getNombreDestinatario,
  getCodigoDestinatario,
  getCompartimientoNombre
} from '../../../../core/models/asignacion.model';
import { Bombero } from '../../../../core/models/bombero.model';
import { Equipo } from '../../../../core/models/equipo.model';
import { Epp } from '../../../../core/models/epp.model';
import { Bien } from '../../../../core/models/bien.model';
import { Vehiculo } from '../../../../core/models/vehiculo.model';
import { Ubicacion } from '../../../../core/models/ubicacion.model';
import { Compartimiento } from '../../../../core/models/compartimiento.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asignacion-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asignacion-detail.component.html',
  styleUrls: ['./asignacion-detail.component.css']
})
export class AsignacionDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private asignacionService = inject(AsignacionService);
  private bomberoService = inject(BomberoService);
  private equipoService = inject(EquipoService);
  private eppService = inject(EppService);
  private bienService = inject(BienService);
  private vehiculoService = inject(VehiculoService);
  private ubicacionService = inject(UbicacionService);
  private compartimientoService = inject(CompartimientoService);
  private toastr = inject(ToastrService);

  asignacion = signal<Asignacion | null>(null);
  bombero = signal<Bombero | null>(null);
  equipo = signal<Equipo | null>(null);
  epp = signal<Epp | null>(null);
  bien = signal<Bien | null>(null);
  vehiculo = signal<Vehiculo | null>(null);
  ubicacion = signal<Ubicacion | null>(null);
  compartimiento = signal<Compartimiento | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // Helpers
  formatearEstadoAsignacion = formatearEstadoAsignacion;
  getEstadoAsignacionBadgeClass = getEstadoAsignacionBadgeClass;
  getTipoRecurso = getTipoRecurso;
  getNombreRecurso = getNombreRecurso;
  getCodigoRecurso = getCodigoRecurso;
  getNombreDestinatario = getNombreDestinatario;
  getCodigoDestinatario = getCodigoDestinatario;
  getCompartimientoNombre = getCompartimientoNombre;

  ngOnInit(): void {
    this.loadAsignacion();
  }

  loadAsignacion(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/asignaciones']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.asignacionService.getById(id).subscribe({
        next: (asignacion) => {
          this.asignacion.set(asignacion);
          this.cargarDatosRelacionados(asignacion);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando la asignación', 'Error');
          this.loading.set(false);
          this.router.navigate(['/asignaciones']);
        }
      })
    );
  }

  private cargarDatosRelacionados(asignacion: Asignacion): void {
    // Cargar recurso
    if (asignacion.equipoId) {
      this.subscriptions.add(
        this.equipoService.getById(asignacion.equipoId).subscribe({
          next: (equipo) => this.equipo.set(equipo),
          error: () => this.equipo.set(null)
        })
      );
    }
    if (asignacion.eppId) {
      this.subscriptions.add(
        this.eppService.getById(asignacion.eppId).subscribe({
          next: (epp) => this.epp.set(epp),
          error: () => this.epp.set(null)
        })
      );
    }
    if (asignacion.bienId) {
      this.subscriptions.add(
        this.bienService.getById(asignacion.bienId).subscribe({
          next: (bien) => this.bien.set(bien),
          error: () => this.bien.set(null)
        })
      );
    }

    // Cargar destino
    if (asignacion.tipoDestino === 'BOMBERO' && asignacion.bomberoId) {
      this.subscriptions.add(
        this.bomberoService.getById(asignacion.bomberoId).subscribe({
          next: (bombero) => this.bombero.set(bombero),
          error: () => this.bombero.set(null)
        })
      );
    }
    if (asignacion.tipoDestino === 'VEHICULO' && asignacion.vehiculoId) {
      this.subscriptions.add(
        this.vehiculoService.getById(asignacion.vehiculoId).subscribe({
          next: (vehiculo) => this.vehiculo.set(vehiculo),
          error: () => this.vehiculo.set(null)
        })
      );
    }
    if (asignacion.tipoDestino === 'UBICACION' && asignacion.ubicacionId) {
      this.subscriptions.add(
        this.ubicacionService.getById(asignacion.ubicacionId).subscribe({
          next: (ubicacion) => this.ubicacion.set(ubicacion),
          error: () => this.ubicacion.set(null)
        })
      );
    }

    // Cargar compartimiento
    if (asignacion.compartimientoId) {
      this.subscriptions.add(
        this.compartimientoService.getById(asignacion.compartimientoId).subscribe({
          next: (compartimiento) => this.compartimiento.set(compartimiento),
          error: () => this.compartimiento.set(null)
        })
      );
    }
  }

  // Verificar si es editable (solo activas)
  esEditable(): boolean {
    const asignacion = this.asignacion();
    return asignacion?.estado === 'ACTIVA' && asignacion?.activo === true;
  }

  // Formatear fecha
  formatFecha(date: string | null | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener nombre del recurso con cache
  getNombreRecursoCached(asignacion: Asignacion): string {
    if (asignacion.equipoId && this.equipo()) {
      return this.equipo()!.nombreEquipo;
    }
    if (asignacion.eppId && this.epp()) {
      return this.epp()!.nombreEpp;
    }
    if (asignacion.bienId && this.bien()) {
      return this.bien()!.nombre;
    }
    return 'N/A';
  }

  getCodigoRecursoCached(asignacion: Asignacion): string {
    if (asignacion.equipoId && this.equipo()) {
      return this.equipo()!.codigoCgbvp || this.equipo()!.numeroSerie || 'N/A';
    }
    if (asignacion.eppId && this.epp()) {
      return this.epp()!.codigoCgbvp || this.epp()!.numeroSerie || 'N/A';
    }
    if (asignacion.bienId && this.bien()) {
      return this.bien()!.codigoCgbvp || 'N/A';
    }
    return 'N/A';
  }

  getNombreDestinatarioCached(asignacion: Asignacion): string {
    if (asignacion.tipoDestino === 'BOMBERO' && this.bombero()) {
      return `${this.bombero()!.nombre} ${this.bombero()!.apellido}`;
    }
    if (asignacion.tipoDestino === 'VEHICULO' && this.vehiculo()) {
      return this.vehiculo()!.nombreVehiculo;
    }
    if (asignacion.tipoDestino === 'UBICACION' && this.ubicacion()) {
      return this.ubicacion()!.nombre;
    }
    return 'N/A';
  }

  getCodigoDestinatarioCached(asignacion: Asignacion): string {
    if (asignacion.tipoDestino === 'BOMBERO' && this.bombero()) {
      return this.bombero()!.codigoCgbvp;
    }
    if (asignacion.tipoDestino === 'VEHICULO' && this.vehiculo()) {
      return this.vehiculo()!.codigo;
    }
    if (asignacion.tipoDestino === 'UBICACION' && this.ubicacion()) {
      return this.ubicacion()!.codigo;
    }
    return 'N/A';
  }

  getCompartimientoNombreCached(asignacion: Asignacion): string {
    if (asignacion.compartimientoId && this.compartimiento()) {
      return this.compartimiento()!.nombre;
    }
    return 'N/A';
  }

  // Acciones
  editar(): void {
    const asignacion = this.asignacion();
    if (asignacion?.id) {
      this.router.navigate(['/asignaciones', asignacion.id, 'editar']);
    }
  }

  eliminar(): void {
    const asignacion = this.asignacion();
    if (!asignacion) return;

    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      this.subscriptions.add(
        this.asignacionService.deleteById(asignacion.id).subscribe({
          next: () => {
            this.toastr.success('Asignación eliminada correctamente', 'Éxito');
            this.router.navigate(['/asignaciones']);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando la asignación', 'Error');
          }
        })
      );
    }
  }

  devolver(): void {
    const asignacion = this.asignacion();
    if (!asignacion) return;

    if (confirm('¿Confirmar devolución de este recurso?')) {
      this.subscriptions.add(
        this.asignacionService.devolver(asignacion.id).subscribe({
          next: () => {
            this.toastr.success('Recurso devuelto correctamente', 'Éxito');
            this.loadAsignacion();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al devolver el recurso', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/asignaciones']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
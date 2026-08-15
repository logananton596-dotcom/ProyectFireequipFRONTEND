// src/app/modules/ubicaciones/pages/ubicacion-detail/ubicacion-detail.component.ts

import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import { Ubicacion, formatearNombreUbicacion, getEstadoUbicacionBadgeClass } from '../../../../core/models/ubicacion.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ubicacion-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ubicacion-detail.component.html',
  styleUrls: ['./ubicacion-detail.component.css']
})
export class UbicacionDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ubicacionService = inject(UbicacionService);
  private toastr = inject(ToastrService);

  ubicacion = signal<Ubicacion | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  formatearNombreUbicacion = formatearNombreUbicacion;
  getEstadoUbicacionBadgeClass = getEstadoUbicacionBadgeClass;

  ngOnInit(): void {
    this.loadUbicacion();
  }

  loadUbicacion(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/ubicaciones']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.ubicacionService.getById(id).subscribe({
        next: (ubicacion) => {
          this.ubicacion.set(ubicacion);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando la ubicación', 'Error');
          this.loading.set(false);
          this.router.navigate(['/ubicaciones']);
        }
      })
    );
  }

  editar(): void {
    const ubicacion = this.ubicacion();
    if (ubicacion?.id) {
      this.router.navigate(['/ubicaciones', ubicacion.id, 'editar']);
    }
  }

  eliminar(): void {
    const ubicacion = this.ubicacion();
    if (!ubicacion) return;

    if (confirm(`¿Está seguro de eliminar la ubicación "${formatearNombreUbicacion(ubicacion.nombreUbicacion)}"?`)) {
      this.subscriptions.add(
        this.ubicacionService.deleteById(ubicacion.id!).subscribe({
          next: () => {
            this.toastr.success('Ubicación eliminada correctamente', 'Éxito');
            this.router.navigate(['/ubicaciones']);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando la ubicación', 'Error');
          }
        })
      );
    }
  }

  cambiarEstado(activar: boolean): void {
    const ubicacion = this.ubicacion();
    if (!ubicacion?.id) return;

    const action = activar ? this.ubicacionService.activar(ubicacion.id) : this.ubicacionService.desactivar(ubicacion.id);
    this.subscriptions.add(
      action.subscribe({
        next: () => {
          this.toastr.success(`Ubicación ${activar ? 'activada' : 'desactivada'} correctamente`, 'Éxito');
          this.loadUbicacion();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
        }
      })
    );
  }

  volver(): void {
    this.router.navigate(['/ubicaciones']);
  }

  formatFecha(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
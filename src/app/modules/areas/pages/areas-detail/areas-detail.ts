
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AreaService } from '../../../../core/services/area.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Area, formatearNombreArea } from '../../../../core/models/area.model';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-areas-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './areas-detail.html',
  styleUrls: ['./areas-detail.css']
})
export class AreasDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private areaService = inject(AreaService);
  private bomberoService = inject(BomberoService);
  private toastr = inject(ToastrService);

  // Signals
  area = signal<Area | null>(null);
  encargado1 = signal<Bombero | null>(null);
  encargado2 = signal<Bombero | null>(null);
  loading = signal(false);

  private subscriptions: Subscription = new Subscription();
  formatearNombreArea = formatearNombreArea;

  ngOnInit(): void {
    this.loadArea();
  }

  loadArea(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/areas']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.areaService.getById(id).subscribe({
        next: (area) => {
          this.area.set(area);
          this.cargarEncargados(area);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el área', 'Error');
          this.loading.set(false);
          this.router.navigate(['/areas']);
        }
      })
    );
  }

  private cargarEncargados(area: Area): void {
    // Cargar encargado principal
    this.subscriptions.add(
      this.bomberoService.getById(area.encargado1Id).subscribe({
        next: (bombero) => {
          this.encargado1.set(bombero);
        },
        error: () => {
          this.encargado1.set(null);
        }
      })
    );

    // Cargar encargado secundario si existe
    if (area.encargado2Id) {
      this.subscriptions.add(
        this.bomberoService.getById(area.encargado2Id).subscribe({
          next: (bombero) => {
            this.encargado2.set(bombero);
          },
          error: () => {
            this.encargado2.set(null);
          }
        })
      );
    }
  }

  editar(): void {
    const area = this.area();
    if (area?.id) {
      this.router.navigate(['/areas', area.id, 'editar']);
    }
  }

  eliminar(): void {
    const area = this.area();
    if (!area) return;

    const nombre = formatearNombreArea(area.nombreArea);
    if (confirm(`¿Está seguro de eliminar el área "${nombre}"?`)) {
      this.subscriptions.add(
        this.areaService.deleteById(area.id!).subscribe({
          next: () => {
            this.toastr.success('Área eliminada correctamente', 'Éxito');
            this.router.navigate(['/areas']);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando el área', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/areas']);
  }

  // Helper para obtener badge de estado
  getActivoBadgeClass(activo: boolean): string {
    return activo ? 'bg-success text-white' : 'bg-danger text-white';
  }

  // Helper para formatear fecha
  formatFecha(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Helper para obtener display del bombero
  getBomberoDisplay(bombero: Bombero | null): string {
    if (!bombero) return 'No asignado';
    return `${bombero.codigoCgbvp} - ${bombero.grado} ${bombero.nombre} ${bombero.apellido}`;
  }

  // Helper para obtener badge de estado del bombero
  getEstadoBomberoBadge(estado: string): string {
    switch (estado) {
      case 'ACTIVO': return 'bg-success text-white';
      case 'RESERVA': return 'bg-warning text-dark';
      case 'BAJA': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
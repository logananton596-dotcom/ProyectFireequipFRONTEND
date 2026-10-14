import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EquipoService } from '../../../../core/services/equipo.service';
import {
  Equipo,
  formatearNombreEquipo,
  formatearTipoEquipo,
  formatearTipoInventario,
  formatearEstadoEquipo,
  getEstadoEquipoBadgeClass
} from '../../../../core/models/equipo.model';
import { formatearCompania } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-equipo-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipo-detail.html',
  styleUrls: ['./equipo-detail.css']
})
export class EquiposDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private equipoService = inject(EquipoService);
  private toastr = inject(ToastrService);

  equipo = signal<Equipo | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // Helpers
  formatearNombreEquipo = formatearNombreEquipo;
  formatearTipoEquipo = formatearTipoEquipo;
  formatearTipoInventario = formatearTipoInventario;
  formatearEstadoEquipo = formatearEstadoEquipo;
  formatearCompania = formatearCompania;
  getEstadoEquipoBadgeClass = getEstadoEquipoBadgeClass;

  ngOnInit(): void {
    this.loadEquipo();
  }

  loadEquipo(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/equipos']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.equipoService.getById(id).subscribe({
        next: (equipo) => {
          this.equipo.set(equipo);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el equipo', 'Error');
          this.loading.set(false);
          this.router.navigate(['/equipos']);
        }
      })
    );
  }

  editar(): void {
    const equipo = this.equipo();
    if (equipo?.id) {
      this.router.navigate(['/equipos', equipo.id, 'editar']);
    }
  }

  eliminar(): void {
    const equipo = this.equipo();
    if (!equipo) return;

    if (confirm(`¿Está seguro de eliminar el equipo "${formatearNombreEquipo(equipo.nombreEquipo)}"?`)) {
      this.subscriptions.add(
        this.equipoService.deleteById(equipo.id!).subscribe({
          next: () => {
            this.toastr.success('Equipo eliminado correctamente', 'Éxito');
            this.router.navigate(['/equipos']);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando el equipo', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/equipos']);
  }

  getAsignadoBadgeClass(asignado: boolean): string {
    return asignado ? 'bg-primary text-white' : 'bg-secondary text-white';
  }

  formatFecha(date: Date | null | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Verifica si es inventario INDIVIDUAL
  esIndividual(): boolean {
    return this.equipo()?.tipoInventario === 'INDIVIDUAL';
  }

  // Verifica si es inventario MULTIPLE
  esMultiple(): boolean {
    return this.equipo()?.tipoInventario === 'MULTIPLE';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
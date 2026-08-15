// src/app/modules/epp/pages/epp-detail/epp-detail.component.ts

import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EppService } from '../../../../core/services/epp.service';
import { AreaService } from '../../../../core/services/area.service';
import { Epp, formatearTipoEpp, formatearNombreEpp, getEstadoEppBadgeClass, EstadoEpp } from '../../../../core/models/epp.model';
import { formatearCompania } from '../../../../core/models/bombero.model';
import { Area } from '../../../../core/models/area.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-epp-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './epp-detail.html',
  styleUrls: ['./epp-detail.css']
})
export class EppDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eppService = inject(EppService);
  private areaService = inject(AreaService);
  private toastr = inject(ToastrService);

  epp = signal<Epp | null>(null);
  areaNombre = signal<string>('');
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // Helpers
  formatearTipoEpp = formatearTipoEpp;
  formatearNombreEpp = formatearNombreEpp;
  formatearCompania = formatearCompania;
  getEstadoEppBadgeClass = getEstadoEppBadgeClass;

  ngOnInit(): void {
    this.loadEpp();
  }

  loadEpp(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/epp']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.eppService.getById(id).subscribe({
        next: (epp) => {
          this.epp.set(epp);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el EPP', 'Error');
          this.loading.set(false);
          this.router.navigate(['/epp']);
        }
      })
    );
  }


  private cargarArea(areaId: number): void {
    this.subscriptions.add(
      this.areaService.getById(areaId).subscribe({
        next: (area) => {
          this.areaNombre.set(this.formatearNombreArea(area.nombreArea));
        },
        error: () => {
          this.areaNombre.set(`Área #${areaId}`);
        }
      })
    );
  }

  private formatearNombreArea(nombre: string): string {
    return nombre.replace('AREA_', 'Área de ')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letra) => letra.toUpperCase());
  }

  editar(): void {
    const epp = this.epp();
    if (epp?.id) {
      this.router.navigate(['/epp', epp.id, 'editar']);
    }
  }

  eliminar(): void {
    const epp = this.epp();
    if (!epp) return;

    if (confirm(`¿Está seguro de eliminar el EPP "${formatearNombreEpp(epp.nombreEpp)}"?`)) {
      this.subscriptions.add(
        this.eppService.deleteById(epp.id!).subscribe({
          next: () => {
            this.toastr.success('EPP eliminado correctamente', 'Éxito');
            this.router.navigate(['/epp']);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando el EPP', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/epp']);
  }

  // Badge para estado de asignación
  getAsignadoBadgeClass(asignado: boolean): string {
    return asignado ? 'bg-primary text-white' : 'bg-secondary text-white';
  }

  // Formatear fecha para mostrar
  formatFecha(date: Date | null | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
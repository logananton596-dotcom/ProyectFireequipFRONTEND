// src/app/modules/ubicaciones/pages/ubicacion-list/ubicacion-list.component.ts

import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import { Ubicacion, formatearNombreUbicacion, getEstadoUbicacionBadgeClass } from '../../../../core/models/ubicacion.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ubicacion-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ubicacion-list.component.html',
  styleUrls: ['./ubicacion-list.component.css']
})
export class UbicacionListComponent implements OnInit, OnDestroy {
  private ubicacionService = inject(UbicacionService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  private ubicacionesSignal = signal<Ubicacion[]>([]);
  loading = false;
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];

  formatearNombreUbicacion = formatearNombreUbicacion;
  getEstadoUbicacionBadgeClass = getEstadoUbicacionBadgeClass;

  filteredUbicaciones = computed<Ubicacion[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const lista = this.ubicacionesSignal();
    if (!term) return lista;
    return lista.filter(u =>
      u.codigo.toLowerCase().includes(term) ||
      u.nombreUbicacion.toLowerCase().includes(term) ||
      (u.observacion && u.observacion.toLowerCase().includes(term))
    );
  });

  ubicacionesPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return this.filteredUbicaciones().slice(inicio, inicio + this.tamanoPagina());
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredUbicaciones().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  ngOnInit(): void {
    this.loadUbicaciones();
  }

  loadUbicaciones(): void {
    this.loading = true;
    this.subscriptions.add(
      this.ubicacionService.getAll().subscribe({
        next: (data) => {
          this.ubicacionesSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cargar ubicaciones', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  verDetalle(id: number): void {
    this.router.navigate(['/ubicaciones', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/ubicaciones', id, 'editar']);
  }

  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar la ubicación "${nombre}"?`)) {
      this.subscriptions.add(
        this.ubicacionService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Ubicación eliminada correctamente', 'Éxito');
            this.loadUbicaciones();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar la ubicación', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  cambiarEstado(id: number, activar: boolean): void {
    const action = activar ? this.ubicacionService.activar(id) : this.ubicacionService.desactivar(id);
    this.subscriptions.add(
      action.subscribe({
        next: () => {
          this.toastr.success(`Ubicación ${activar ? 'activada' : 'desactivada'} correctamente`, 'Éxito');
          this.loadUbicaciones();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
        }
      })
    );
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
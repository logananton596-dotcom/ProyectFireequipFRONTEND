import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EppService } from '../../../../core/services/epp.service';
import { Epp, formatearTipoEpp, formatearNombreEpp, getEstadoEppBadgeClass, EstadoEpp } from '../../../../core/models/epp.model';
import { formatearCompania } from '../../../../core/models/bombero.model';
import { Area } from '../../../../core/models/area.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { formatearNombreUbicacion, Ubicacion } from '../../../../core/models/ubicacion.model';

@Component({
  selector: 'app-epp-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './epp-list.html',
  styleUrls: ['./epp-list.css']
})
export class EppList implements OnInit, OnDestroy {
  private eppService = inject(EppService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  private eppsSignal = signal<Epp[]>([]);

  loading = false;
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];

  // Helpers
  formatearTipoEpp = formatearTipoEpp;
  formatearNombreEpp = formatearNombreEpp;
  formatearCompania = formatearCompania;

  getEstadoEppBadgeClass = getEstadoEppBadgeClass;
  // Filtro con todos los campos relevantes
  filteredEpps = computed<Epp[]>(() => {
    
    const term = this.searchTerm().toLowerCase().trim();
    const listaOriginal = this.eppsSignal();

    if (!term) return listaOriginal;

    return listaOriginal.filter(epp => {
      const areaTexto = (epp.areaNombre ?? '').toLowerCase();
      return (
        (epp.codigoCgbvp && epp.codigoCgbvp.toLowerCase().includes(term)) ||
        (epp.numeroSerie && epp.numeroSerie.toLowerCase().includes(term)) ||
        (epp.tipoEpp && epp.tipoEpp.toLowerCase().includes(term)) ||
        (epp.nombreEpp && epp.nombreEpp.toLowerCase().includes(term)) ||
        (epp.compania && epp.compania.toLowerCase().includes(term)) ||
        (epp.estado && epp.estado.toLowerCase().includes(term)) ||
        areaTexto.includes(term)
      );
    });
  });

  eppsPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredEpps().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredEpps().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  ngOnInit(): void {
    this.loadEpps();
  }
   public ubicacionesMap: Map<number, Ubicacion> = new Map<number, Ubicacion>();

  getUbicacionNombre(ubicacionId?: number): string {
  if (!ubicacionId) return 'N/A';
  const ubicacion = this.ubicacionesMap.get(ubicacionId);
  return ubicacion ? formatearNombreUbicacion(ubicacion.nombreUbicacion) : `Ubicación #${ubicacionId}`;
}

  loadEpps(): void {
    this.loading = true;
    this.subscriptions.add(
      this.eppService.getAll().subscribe({
        next: (data) => {
          this.eppsSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error cargando EPP:', error);
          this.toastr.error(error.error?.message || 'Error al cargar la lista de EPP', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }
  public formatFecha(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  verDetalle(id: number): void {
    this.router.navigate(['/epp', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/epp', id, 'editar']);
  }

  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el EPP "${nombre}"?`)) {
      this.subscriptions.add(
        this.eppService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('EPP eliminado correctamente', 'Éxito');
            this.loadEpps();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar el EPP', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  // Badge para estado de asignación
  getAsignadoBadgeClass(asignado: boolean): string {
    return asignado ? 'bg-primary text-white' : 'bg-secondary text-white';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
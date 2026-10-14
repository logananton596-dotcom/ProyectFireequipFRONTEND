import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BienService } from '../../../../core/services/bien.service';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import { 
  Bien, 
  formatearTipoBien, 
  formatearEstadoBien,
  getEstadoBienBadgeClass,
  EstadoBien
} from '../../../../core/models/bien.model';
import { Ubicacion } from '../../../../core/models/ubicacion.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bien-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './bien-list.component.html',
  styleUrls: ['./bien-list.component.css']
})
export class BienListComponent implements OnInit, OnDestroy {
  private bienService = inject(BienService);
  private ubicacionService = inject(UbicacionService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  // Signals
  private bienesSignal = signal<Bien[]>([]);
  private ubicacionesMap = new Map<number, Ubicacion>();
  loading = false;
  private subscriptions: Subscription = new Subscription();

  // Búsqueda y paginación
  searchTerm = signal<string>('');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];

  // Helpers
  formatearTipoBien = formatearTipoBien;
  formatearEstadoBien = formatearEstadoBien;
  getEstadoBienBadgeClass = getEstadoBienBadgeClass;

  ngOnInit(): void {
    this.cargarUbicaciones();
    this.loadBienes();
  }

  private cargarUbicaciones(): void {
    this.subscriptions.add(
      this.ubicacionService.getActivas().subscribe({
        next: (ubicaciones) => {
          ubicaciones.forEach(u => {
            if (u.id) this.ubicacionesMap.set(u.id, u);
          });
        },
        error: () => {
          this.toastr.warning('No se pudieron cargar las ubicaciones', 'Advertencia');
        }
      })
    );
  }

  getUbicacionDisplay(ubicacionId: number): string {
    const ubicacion = this.ubicacionesMap.get(ubicacionId);
    if (!ubicacion) return `UB-${ubicacionId}`;
    return `${ubicacion.codigo} - ${ubicacion.nombre}`;
  }

  // Filtro
  filteredBienes = computed<Bien[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const listaOriginal = this.bienesSignal();

    if (!term) return listaOriginal;

    return listaOriginal.filter(bien =>
      (bien.codigoCgbvp && bien.codigoCgbvp.toLowerCase().includes(term)) ||
      (bien.nombre && bien.nombre.toLowerCase().includes(term)) ||
      (bien.tipoBien && bien.tipoBien.toLowerCase().includes(term)) ||
      (bien.areaNombre && bien.areaNombre.toLowerCase().includes(term)) ||
      (bien.estado && bien.estado.toLowerCase().includes(term)) ||
      (bien.marca && bien.marca.toLowerCase().includes(term)) ||
      (bien.modelo && bien.modelo.toLowerCase().includes(term))
    );
  });

  bienesPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredBienes().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredBienes().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  loadBienes(): void {
    this.loading = true;
    this.subscriptions.add(
      this.bienService.getAll().subscribe({
        next: (data) => {
          this.bienesSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cargar bienes', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  verDetalle(id: number): void {
    this.router.navigate(['/bienes', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/bienes', id, 'editar']);
  }

  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el bien "${nombre}"?`)) {
      this.subscriptions.add(
        this.bienService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Bien eliminado correctamente', 'Éxito');
            this.loadBienes();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar el bien', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
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
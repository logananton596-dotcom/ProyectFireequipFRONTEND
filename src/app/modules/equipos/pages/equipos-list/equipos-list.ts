import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EquipoService } from '../../../../core/services/equipo.service';
import { 
  Equipo, 
  formatearNombreEquipo, 
  formatearTipoEquipo,
  formatearTipoInventario,
  getEstadoEquipoBadgeClass,
  EstadoEquipo
} from '../../../../core/models/equipo.model';
import { formatearCompania } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-equipo-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './equipos-list.html',
  styleUrls: ['./equipos-list.css']
})
export class EquiposList implements OnInit, OnDestroy {
  private equipoService = inject(EquipoService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  private equiposSignal = signal<Equipo[]>([]);
  loading = false;
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];

  // Helpers
  formatearNombreEquipo = formatearNombreEquipo;
  formatearTipoEquipo = formatearTipoEquipo;
  formatearTipoInventario = formatearTipoInventario;
  formatearCompania = formatearCompania;
  getEstadoEquipoBadgeClass = getEstadoEquipoBadgeClass;

  // Carga áreas para mostrar nombre
  ngOnInit(): void {
    this.loadEquipos();
  }

  // Filtro
  filteredEquipos = computed<Equipo[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const listaOriginal = this.equiposSignal();

    if (!term) return listaOriginal;

    return listaOriginal.filter(equipo =>
      (equipo.codigoCgbvp && equipo.codigoCgbvp.toLowerCase().includes(term)) ||
      (equipo.numeroSerie && equipo.numeroSerie.toLowerCase().includes(term)) ||
      (equipo.nombreEquipo && equipo.nombreEquipo.toLowerCase().includes(term)) ||
      (equipo.tipoEquipo && equipo.tipoEquipo.toLowerCase().includes(term)) ||
      (equipo.compania && equipo.compania.toLowerCase().includes(term)) ||
      (equipo.estado && equipo.estado.toLowerCase().includes(term)) ||
      (equipo.areaNombre && equipo.areaNombre.toLowerCase().includes(term)) ||
      (equipo.marca && equipo.marca.toLowerCase().includes(term)) ||
      (equipo.modelo && equipo.modelo.toLowerCase().includes(term))
    );
  });

  equiposPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredEquipos().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredEquipos().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  loadEquipos(): void {
    this.loading = true;
    this.subscriptions.add(
      this.equipoService.getAll().subscribe({
        next: (data) => {
          this.equiposSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cargar equipos', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  verDetalle(id: number): void {
    this.router.navigate(['/equipos', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/equipos', id, 'editar']);
  }

  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el equipo "${nombre}"?`)) {
      this.subscriptions.add(
        this.equipoService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Equipo eliminado correctamente', 'Éxito');
            this.loadEquipos();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar el equipo', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  getAsignadoBadgeClass(asignado: boolean): string {
    return asignado ? 'bg-primary text-white' : 'bg-secondary text-white';
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
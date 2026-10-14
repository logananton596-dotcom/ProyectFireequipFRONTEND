import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CasilleroService } from '../../../../core/services/casillero.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { 
  Casillero, 
  getEstadoCasilleroBadgeClass, 
  formatearEstadoCasillero,
  getAsignacionBadgeClass,
  formatearAsignacion,
  getCasilleroDisplay
} from '../../../../core/models/casillero.model';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-casillero-list',
  standalone: true,
  imports: [CommonModule,RouterLink, FormsModule],
  templateUrl: './casillero-list.component.html',
  styleUrls: ['./casillero-list.component.css']
})
export class CasilleroListComponent implements OnInit, OnDestroy {
  private casilleroService = inject(CasilleroService);
  private bomberoService = inject(BomberoService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  private casillerosSignal = signal<Casillero[]>([]);
  private bomberosMap = new Map<number, Bombero>();
  loading = false;
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  filtroEstado = signal<string>('TODOS');
  filtroAsignacion = signal<string>('TODOS');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];

  // Helpers
  getEstadoCasilleroBadgeClass = getEstadoCasilleroBadgeClass;
  formatearEstadoCasillero = formatearEstadoCasillero;
  getAsignacionBadgeClass = getAsignacionBadgeClass;
  formatearAsignacion = formatearAsignacion;
  getCasilleroDisplay = getCasilleroDisplay;

  ngOnInit(): void {
    this.cargarBomberos();
    this.loadCasilleros();
  }

  private cargarBomberos(): void {
    this.subscriptions.add(
      this.bomberoService.getActivos().subscribe({
        next: (data) => {
          data.forEach(b => { if (b.id) this.bomberosMap.set(b.id, b); });
        },
        error: () => {
          this.toastr.warning('No se pudieron cargar los bomberos', 'Advertencia');
        }
      })
    );
  }

  getBomberoNombre(bomberoId?: number | null): string {
    if (!bomberoId) return '—';
    const bombero = this.bomberosMap.get(bomberoId);
    return bombero ? `${bombero.nombre} ${bombero.apellido}` : `Bombero #${bomberoId}`;
  }

  loadCasilleros(): void {
    this.loading = true;
    this.subscriptions.add(
      this.casilleroService.getAll().subscribe({
        next: (data) => {
          this.casillerosSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cargar casilleros', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  // Filtro combinado
  filteredCasilleros = computed<Casillero[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const estado = this.filtroEstado();
    const asignacion = this.filtroAsignacion();

    const listaOriginal = this.casillerosSignal();

    return listaOriginal.filter(item => {
      // Búsqueda por texto
      const matchText = !term ||
        item.codigo.toLowerCase().includes(term) ||
        item.numero.toLowerCase().includes(term) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(term)) ||
        (item.edificio && item.edificio.toLowerCase().includes(term)) ||
        (item.piso && item.piso.toLowerCase().includes(term));

      // Filtro por estado
      const matchEstado = estado === 'TODOS' ||
        (estado === 'ACTIVO' && item.activo) ||
        (estado === 'INACTIVO' && !item.activo);

      // Filtro por asignación
      const matchAsignacion = asignacion === 'TODOS' ||
        (asignacion === 'ASIGNADO' && item.bomberoId) ||
        (asignacion === 'DISPONIBLE' && !item.bomberoId);

      return matchText && matchEstado && matchAsignacion;
    });
  });

  casillerosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredCasilleros().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredCasilleros().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  verDetalle(id: number): void {
    this.router.navigate(['/casilleros', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/casilleros', id, 'editar']);
  }

  eliminar(id: number, numero: string): void {
    if (confirm(`¿Está seguro de eliminar el casillero "${numero}"?`)) {
      this.subscriptions.add(
        this.casilleroService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Casillero eliminado correctamente', 'Éxito');
            this.loadCasilleros();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar el casillero', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  cambiarEstado(id: number, activo: boolean, numero: string): void {
    const nuevoEstado = activo ? 'inactivar' : 'activar';
    if (confirm(`¿${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)} el casillero "${numero}"?`)) {
      this.subscriptions.add(
        this.casilleroService.cambiarEstado(id, !activo).subscribe({
          next: () => {
            this.toastr.success(`Casillero ${activo ? 'inactivado' : 'activado'} correctamente`, 'Éxito');
            this.loadCasilleros();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  // Métodos de paginación
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

  // Reset de filtros
  limpiarFiltros(): void {
    this.searchTerm.set('');
    this.filtroEstado.set('TODOS');
    this.filtroAsignacion.set('TODOS');
    this.paginaActual.set(1);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
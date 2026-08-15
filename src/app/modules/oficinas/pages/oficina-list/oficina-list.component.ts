import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OficinaService } from '../../../../core/services/oficina.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Oficina, getEstadoOficinaBadgeClass, formatearEstadoOficina, getOficinaDisplay } from '../../../../core/models/oficina.model';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-oficina-list',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './oficina-list.component.html',
  styleUrls: ['./oficina-list.component.css']
})
export class OficinaListComponent implements OnInit, OnDestroy {
  private oficinaService = inject(OficinaService);
  private bomberoService = inject(BomberoService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  private oficinasSignal = signal<Oficina[]>([]);
  private bomberosMap = new Map<number, Bombero>();
  loading = false;
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  filtroEstado = signal<string>('TODOS');
  filtroPiso = signal<string>('TODOS');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];

  // Pisos disponibles para filtro
  pisosDisponibles = signal<string[]>([]);

  // Helpers
  getEstadoOficinaBadgeClass = getEstadoOficinaBadgeClass;
  formatearEstadoOficina = formatearEstadoOficina;
  getOficinaDisplay = getOficinaDisplay;

  ngOnInit(): void {
    this.cargarBomberos();
    this.loadOficinas();
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

  getResponsableNombre(responsableId?: number | null | undefined): string {
    if (!responsableId) return '—';
    const bombero = this.bomberosMap.get(responsableId);
    return bombero ? `${bombero.nombre} ${bombero.apellido}` : `Bombero #${responsableId}`;
  }

  loadOficinas(): void {
    this.loading = true;
    this.subscriptions.add(
      this.oficinaService.getAll().subscribe({
        next: (data) => {
          this.oficinasSignal.set(data);
          this.actualizarPisos(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cargar oficinas', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  private actualizarPisos(oficinas: Oficina[]): void {
    const pisos = new Set<string>();
    oficinas.forEach(o => {
      if (o.piso) pisos.add(o.piso);
    });
    this.pisosDisponibles.set(['TODOS', ...Array.from(pisos)]);
  }

  // Filtro combinado
  filteredOficinas = computed<Oficina[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const estado = this.filtroEstado();
    const piso = this.filtroPiso();

    const listaOriginal = this.oficinasSignal();

    return listaOriginal.filter(item => {
      // Búsqueda por texto
      const matchText = !term ||
        item.codigo.toLowerCase().includes(term) ||
        item.nombre.toLowerCase().includes(term) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(term)) ||
        (item.edificio && item.edificio.toLowerCase().includes(term)) ||
        (item.piso && item.piso.toLowerCase().includes(term));

      // Filtro por estado
      const matchEstado = estado === 'TODOS' ||
        (estado === 'ACTIVO' && item.activo) ||
        (estado === 'INACTIVO' && !item.activo);

      // Filtro por piso
      const matchPiso = piso === 'TODOS' || item.piso === piso;

      return matchText && matchEstado && matchPiso;
    });
  });

  oficinasPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredOficinas().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredOficinas().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  verDetalle(id: number): void {
    this.router.navigate(['/oficinas', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/oficinas', id, 'editar']);
  }

  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar la oficina "${nombre}"?`)) {
      this.subscriptions.add(
        this.oficinaService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Oficina eliminada correctamente', 'Éxito');
            this.loadOficinas();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar la oficina', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  cambiarEstado(id: number, activo: boolean, nombre: string): void {
    const nuevoEstado = activo ? 'inactivar' : 'activar';
    if (confirm(`¿${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)} la oficina "${nombre}"?`)) {
      this.subscriptions.add(
        this.oficinaService.cambiarEstado(id, !activo).subscribe({
          next: () => {
            this.toastr.success(`Oficina ${activo ? 'inactivada' : 'activada'} correctamente`, 'Éxito');
            this.loadOficinas();
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
    this.filtroPiso.set('TODOS');
    this.paginaActual.set(1);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
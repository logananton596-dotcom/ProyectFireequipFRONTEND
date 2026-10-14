import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AsignacionService } from '../../../../core/services/asignacion.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { EquipoService } from '../../../../core/services/equipo.service';
import { EppService } from '../../../../core/services/epp.service';
import { BienService } from '../../../../core/services/bien.service';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import {
  Asignacion,
  EstadoAsignacion,
  ESTADOS_ASIGNACION,
  TIPOS_RECURSO,
  TIPOS_DESTINO,
  formatearEstadoAsignacion,
  getEstadoAsignacionBadgeClass,
  getTipoRecurso,
  getNombreRecurso,
  getCodigoRecurso,
  getNombreDestinatario,
  getCodigoDestinatario,
  getCompartimientoNombre
} from '../../../../core/models/asignacion.model';
import { Bombero } from '../../../../core/models/bombero.model';
import { Equipo } from '../../../../core/models/equipo.model';
import { Epp } from '../../../../core/models/epp.model';
import { Bien } from '../../../../core/models/bien.model';
import { Vehiculo } from '../../../../core/models/vehiculo.model';
import { Ubicacion } from '../../../../core/models/ubicacion.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-asignacion-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './asignacion-list.component.html',
  styleUrls: ['./asignacion-list.component.css']
})
export class AsignacionListComponent implements OnInit, OnDestroy {
  private asignacionService = inject(AsignacionService);
  private bomberoService = inject(BomberoService);
  private equipoService = inject(EquipoService);
  private eppService = inject(EppService);
  private bienService = inject(BienService);
  private vehiculoService = inject(VehiculoService);
  private ubicacionService = inject(UbicacionService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  private asignacionesSignal = signal<Asignacion[]>([]);
  private bomberosMap = new Map<number, Bombero>();
  private equiposMap = new Map<number, Equipo>();
  private eppsMap = new Map<number, Epp>();
  private bienesMap = new Map<number, Bien>();
  private vehiculosMap = new Map<number, Vehiculo>();
  private ubicacionesMap = new Map<number, Ubicacion>();

  loading = false;
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  filtroEstado = signal<string>('TODOS');
  filtroRecurso = signal<string>('TODOS');
  filtroDestino = signal<string>('TODOS');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];

  // Enums para filtros
  estadosDisponibles = ['TODOS', ...ESTADOS_ASIGNACION];
  tiposRecurso = ['TODOS', ...TIPOS_RECURSO];
  tiposDestino = ['TODOS', ...TIPOS_DESTINO];

  // Helpers
  formatearEstadoAsignacion = formatearEstadoAsignacion;
  getEstadoAsignacionBadgeClass = getEstadoAsignacionBadgeClass;
  getTipoRecurso = getTipoRecurso;
  getNombreRecurso = getNombreRecurso;
  getCodigoRecurso = getCodigoRecurso;
  getNombreDestinatario = getNombreDestinatario;
  getCodigoDestinatario = getCodigoDestinatario;
  getCompartimientoNombre = getCompartimientoNombre;

  ngOnInit(): void {
    this.cargarCatalogos();
    this.loadAsignaciones();
  }

  private cargarCatalogos(): void {
    // Bomberos
    this.subscriptions.add(
      this.bomberoService.getActivos().subscribe({
        next: (data) => data.forEach(b => { if (b.id) this.bomberosMap.set(b.id, b); }),
        error: () => this.toastr.warning('No se pudieron cargar los bomberos', 'Advertencia')
      })
    );

    // Equipos
    this.subscriptions.add(
      this.equipoService.getAll().subscribe({
        next: (data) => data.forEach(e => { if (e.id) this.equiposMap.set(e.id, e); }),
        error: () => this.toastr.warning('No se pudieron cargar los equipos', 'Advertencia')
      })
    );

    // EPP
    this.subscriptions.add(
      this.eppService.getAll().subscribe({
        next: (data) => data.forEach(e => { if (e.id) this.eppsMap.set(e.id, e); }),
        error: () => this.toastr.warning('No se pudieron cargar los EPP', 'Advertencia')
      })
    );

    // Bienes
    this.subscriptions.add(
      this.bienService.getAll().subscribe({
        next: (data) => data.forEach(b => { if (b.id) this.bienesMap.set(b.id, b); }),
        error: () => this.toastr.warning('No se pudieron cargar los bienes', 'Advertencia')
      })
    );

    // Vehículos
    this.subscriptions.add(
      this.vehiculoService.getActivos().subscribe({
        next: (data) => data.forEach(v => { if (v.id) this.vehiculosMap.set(v.id, v); }),
        error: () => this.toastr.warning('No se pudieron cargar los vehículos', 'Advertencia')
      })
    );

    // Ubicaciones
    this.subscriptions.add(
      this.ubicacionService.getActivas().subscribe({
        next: (data) => data.forEach(u => { if (u.id) this.ubicacionesMap.set(u.id, u); }),
        error: () => this.toastr.warning('No se pudieron cargar las ubicaciones', 'Advertencia')
      })
    );
  }

  // Obtener nombre del recurso con cache
  getNombreRecursoCached(asignacion: Asignacion): string {
    if (asignacion.equipoId) {
      const equipo = this.equiposMap.get(asignacion.equipoId);
      return equipo?.nombreEquipo || `Equipo #${asignacion.equipoId}`;
    }
    if (asignacion.eppId) {
      const epp = this.eppsMap.get(asignacion.eppId);
      return epp?.nombreEpp || `EPP #${asignacion.eppId}`;
    }
    if (asignacion.bienId) {
      const bien = this.bienesMap.get(asignacion.bienId);
      return bien?.nombre || `Bien #${asignacion.bienId}`;
    }
    return 'N/A';
  }

  getCodigoRecursoCached(asignacion: Asignacion): string {
    if (asignacion.equipoId) {
      const equipo = this.equiposMap.get(asignacion.equipoId);
      return equipo?.codigoCgbvp || equipo?.numeroSerie || `EQ-${asignacion.equipoId}`;
    }
    if (asignacion.eppId) {
      const epp = this.eppsMap.get(asignacion.eppId);
      return epp?.codigoCgbvp || epp?.numeroSerie || `EPP-${asignacion.eppId}`;
    }
    if (asignacion.bienId) {
      const bien = this.bienesMap.get(asignacion.bienId);
      return bien?.codigoCgbvp || `BIEN-${asignacion.bienId}`;
    }
    return 'N/A';
  }

  getNombreDestinatarioCached(asignacion: Asignacion): string {
    if (asignacion.tipoDestino === 'BOMBERO' && asignacion.bomberoId) {
      const bombero = this.bomberosMap.get(asignacion.bomberoId);
      return bombero ? `${bombero.nombre} ${bombero.apellido}` : `Bombero #${asignacion.bomberoId}`;
    }
    if (asignacion.tipoDestino === 'VEHICULO' && asignacion.vehiculoId) {
      const vehiculo = this.vehiculosMap.get(asignacion.vehiculoId);
      return vehiculo?.nombreVehiculo || `Vehículo #${asignacion.vehiculoId}`;
    }
    if (asignacion.tipoDestino === 'UBICACION' && asignacion.ubicacionId) {
      const ubicacion = this.ubicacionesMap.get(asignacion.ubicacionId);
      return ubicacion?.nombre || `Ubicación #${asignacion.ubicacionId}`;
    }
    return 'N/A';
  }

  getCodigoDestinatarioCached(asignacion: Asignacion): string {
    if (asignacion.tipoDestino === 'BOMBERO' && asignacion.bomberoId) {
      const bombero = this.bomberosMap.get(asignacion.bomberoId);
      return bombero?.codigoCgbvp || `B-${asignacion.bomberoId}`;
    }
    if (asignacion.tipoDestino === 'VEHICULO' && asignacion.vehiculoId) {
      const vehiculo = this.vehiculosMap.get(asignacion.vehiculoId);
      return vehiculo?.codigo || `V-${asignacion.vehiculoId}`;
    }
    if (asignacion.tipoDestino === 'UBICACION' && asignacion.ubicacionId) {
      const ubicacion = this.ubicacionesMap.get(asignacion.ubicacionId);
      return ubicacion?.codigo || `UB-${asignacion.ubicacionId}`;
    }
    return 'N/A';
  }

  // Verificar si es editable (solo activas)
  esEditable(asignacion: Asignacion): boolean {
    return asignacion.estado === 'ACTIVA' && asignacion.activo === true;
  }

  // Filtro combinado
  filteredAsignaciones = computed<Asignacion[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const estado = this.filtroEstado();
    const recurso = this.filtroRecurso();
    const destino = this.filtroDestino();

    const listaOriginal = this.asignacionesSignal();

    return listaOriginal.filter(asignacion => {
      const nombreRecurso = this.getNombreRecursoCached(asignacion).toLowerCase();
      const codigoRecurso = this.getCodigoRecursoCached(asignacion).toLowerCase();
      const nombreDestinatario = this.getNombreDestinatarioCached(asignacion).toLowerCase();
      const codigoDestinatario = this.getCodigoDestinatarioCached(asignacion).toLowerCase();

      // Búsqueda por texto
      const matchText = !term ||
        nombreRecurso.includes(term) ||
        codigoRecurso.includes(term) ||
        nombreDestinatario.includes(term) ||
        codigoDestinatario.includes(term);

      // Filtro por estado
      const matchEstado = estado === 'TODOS' || asignacion.estado === estado;

      // Filtro por tipo de recurso
      const tipoRecursoAsignacion = getTipoRecurso(asignacion);
      const matchRecurso = recurso === 'TODOS' || tipoRecursoAsignacion === recurso;

      // Filtro por tipo de destino
      const matchDestino = destino === 'TODOS' || asignacion.tipoDestino === destino;

      return matchText && matchEstado && matchRecurso && matchDestino;
    });
  });

  asignacionesPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredAsignaciones().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredAsignaciones().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  loadAsignaciones(): void {
    this.loading = true;
    this.subscriptions.add(
      this.asignacionService.getAll().subscribe({
        next: (data) => {
          this.asignacionesSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al cargar asignaciones', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  verDetalle(id: number): void {
    this.router.navigate(['/asignaciones', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/asignaciones', id, 'editar']);
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      this.subscriptions.add(
        this.asignacionService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Asignación eliminada correctamente', 'Éxito');
            this.loadAsignaciones();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar la asignación', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  devolver(id: number): void {
    if (confirm('¿Confirmar devolución de este recurso?')) {
      this.subscriptions.add(
        this.asignacionService.devolver(id).subscribe({
          next: () => {
            this.toastr.success('Recurso devuelto correctamente', 'Éxito');
            this.loadAsignaciones();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al devolver el recurso', 'Error');
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

  limpiarFiltros(): void {
    this.searchTerm.set('');
    this.filtroEstado.set('TODOS');
    this.filtroRecurso.set('TODOS');
    this.filtroDestino.set('TODOS');
    this.paginaActual.set(1);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
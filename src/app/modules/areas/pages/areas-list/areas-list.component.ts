import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, signal, computed } from '@angular/core'; // 💡 Importados computed, inject y ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // OBLIGATORIO: Para habilitar el buscador con [(ngModel)]
import { ToastrService } from 'ngx-toastr';
import { AreaService } from '../../../../core/services/area.service';
import { Area, formatearNombreArea } from '../../../../core/models/area.model';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Subscription } from 'rxjs';
import { Bombero } from '../../../../core/models/bombero.model';


@Component({
  selector: 'app-areas-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './areas-list.component.html',
  styleUrls: ['./areas-list.component.css']
})
export class AreasListComponent implements OnInit, OnDestroy {
  private areaService = inject(AreaService);
  private bomberoService = inject(BomberoService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  private areasSignal = signal<Area[]>([]);
  private bomberosMap = new Map<number, Bombero>(); // Cache de bomberos
  loading = false;
  private subscriptions: Subscription = new Subscription();

  searchTerm = signal<string>('');
  paginaActual = signal(1);
  tamanoPagina = signal(10);
  opcionesTamano = [5, 10, 25, 50];
  formatearNombreArea = formatearNombreArea;

  // Filtro de áreas
  filteredAreas = computed<Area[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const listaOriginal = this.areasSignal();

    if (!term) return listaOriginal;

    return listaOriginal.filter(area => {
      const nombreAreaOriginal = area.nombreArea || (area as any).NombreArea;
      const nombre = nombreAreaOriginal ? formatearNombreArea(nombreAreaOriginal).toLowerCase() : '';
      const encargado1 = this.getBomberoNombre(area.encargado1Id).toLowerCase();
      const encargado2 = area.encargado2Id ? this.getBomberoNombre(area.encargado2Id).toLowerCase() : '';
      
      return nombre.includes(term) ||
             encargado1.includes(term) ||
             encargado2.includes(term);
    });
  });

  areasPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    return this.filteredAreas().slice(inicio, fin);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.filteredAreas().length / this.tamanoPagina()) || 1;
  });

  get Math() { return Math; }

  ngOnInit(): void {
    this.cargarBomberos();
    this.loadAreas();
  }

  private cargarBomberos(): void {
    this.subscriptions.add(
      this.bomberoService.getAll().subscribe({
        next: (bomberos) => {
          bomberos.forEach(b => {
            if (b.id) this.bomberosMap.set(b.id, b);
          });
        },
        error: () => {
          this.toastr.warning('No se pudieron cargar los bomberos para el autocomplete', 'Advertencia');
        }
      })
    );
  }

  loadAreas(): void {
    this.loading = true;
    this.subscriptions.add(
      this.areaService.getAll().subscribe({
        next: (data) => {
          this.areasSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1);
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error cargando áreas:', error);
          this.toastr.error('Error al cargar la lista de áreas', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  // Helper para obtener nombre del bombero por ID
  getBomberoNombre(id: number): string {
    const bombero = this.bomberosMap.get(id);
    if (!bombero) return `Bombero #${id}`;
    return `${bombero.codigoCgbvp} - ${bombero.grado} ${bombero.nombre} ${bombero.apellido}`;
  }

  // Helper para badge de estado activo
  getActivoBadgeClass(activo: boolean): string {
    return activo ? 'bg-success text-white' : 'bg-danger text-white';
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
    this.router.navigate(['/areas', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/areas', id, 'editar']);
  }

  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el área "${nombre}"?`)) {
      this.subscriptions.add(
        this.areaService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Área eliminada correctamente', 'Éxito');
            this.loadAreas();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar el área', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
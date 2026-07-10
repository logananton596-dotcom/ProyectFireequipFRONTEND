import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, signal, computed } from '@angular/core'; // 💡 Importados signal y computed
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ToastrService } from 'ngx-toastr';
import { EquipoService } from '../../../../core/services/equipo.service';
import { Equipo } from '../../../../core/models/equipo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-equipos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './equipos-list.html',
  styleUrls: ['./equipos-list.css']
})
export class EquiposList implements OnInit, OnDestroy {
  // Inyección de dependencias moderna y limpia con inject()
  private equipoService = inject(EquipoService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef);

  // 1. Reemplazamos el arreglo clásico por una WritableSignal privada
  private equiposSignal = signal<Equipo[]>([]);
  loading = false;
  private subscriptions: Subscription = new Subscription();
  // ====== VARIABLES PARA EL PAGINADO DINÁMICO ======
  searchTerm = signal<string>('');
  paginaActual = signal(1);
  tamanoPagina = signal(10); // Por defecto muestra de 10 en 10
  opcionesTamano = [5, 10, 25, 50]; // Opciones del desplegable

  // 3. FILTRO ULTRA VELOZ: Se ejecuta automáticamente en la memoria del navegador cada vez que se escribe
  filteredEquipos = computed<Equipo[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const listaOriginal = this.equiposSignal();

    if (!term) {
      return listaOriginal; // Si el buscador está vacío, retorna el listado completo
    }

    // Filtra dinámicamente por nombre, código interno, número de serie o marca de forma segura
    return listaOriginal.filter(equipo => 
      (equipo.nombre && equipo.nombre.toLowerCase().includes(term)) ||
      (equipo.codigoInterno && equipo.codigoInterno.toLowerCase().includes(term)) ||
      (equipo.numeroSerie && equipo.numeroSerie.toLowerCase().includes(term)) ||
      (equipo.area && equipo.area.toLowerCase().includes(term)) ||
      (equipo.estadoEquipoNombre && equipo.estadoEquipoNombre.toLowerCase().includes(term)) ||
      (equipo.marca && equipo.marca.toLowerCase().includes(term))
    );
  });

  // ====== SIGNAL COMPUTADA CORREGIDA: Corta la lista filtrada para paginar ======
  equiposPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    const fin = inicio + this.tamanoPagina();
    // 💡 CAMBIO: Apunta directamente a filteredEquipos() para que la paginación cambie si usas el buscador
    return this.filteredEquipos().slice(inicio, fin); 
  });

  // ====== SIGNAL COMPUTADA CORREGIDA: Calcula el total de páginas según el filtro ======
  totalPaginas = computed(() => {
    // 💡 CAMBIO: Base del total calculada sobre los resultados que quedan del filtro
    return Math.ceil(this.filteredEquipos().length / this.tamanoPagina()) || 1;
  });

  // Para mantener compatibilidad con métodos nativos si el HTML lo requiere
  get equipos(): Equipo[] {
    return this.filteredEquipos();
  }
  // Permite usar la función matemática de manera nativa en el template
  get Math() {
    return Math;
  }

  ngOnInit(): void {
    this.loadEquipos();
  }

  loadEquipos(): void {
    this.loading = true;
    this.subscriptions.add(
      this.equipoService.getAll().subscribe({
        next: (data) => {
          //  Guardamos los datos en la Signal usando .set()
          this.equiposSignal.set(data);
          this.loading = false;
          this.paginaActual.set(1); 
          this.cdRef.detectChanges(); // Fuerza a Angular a pintar la tabla adaptativa
        },
        error: (error) => {
          console.error('Error cargando equipos:', error);
          this.toastr.error('Error al cargar los equipos', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }
  // ====== MÉTODOS DE NAVEGACIÓN DE PÁGINAS ======
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
      this.cdRef.detectChanges();
    }
  }
    // ====== MÉTODO AGREGADO: Escucha la escritura del buscador y resetea la página ======
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.paginaActual.set(1); // Si el usuario busca algo, lo regresa automáticamente a la pág 1
    this.cdRef.detectChanges();
  }

  onTamanoPaginaChange(nuevoTamano: number): void {
    this.tamanoPagina.set(Number(nuevoTamano));
    this.paginaActual.set(1); // Reestablece siempre a la página 1 si cambian el tamaño
    this.cdRef.detectChanges();
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
            this.loadEquipos(); // Recargar lista automática
          },
          error: (error) => {
            console.error('Error eliminando equipo:', error);
            this.toastr.error('Error al eliminar el equipo', 'Error');
            this.cdRef.detectChanges(); 
          }
        })
      );
    }
  }

  // Corregido: Adaptado a las mayúsculas reales de tu base de datos de Docker
  getEstadoBadgeClass(estado: string): string {
    if (!estado) return 'bg-secondary';
    const classes: Record<string, string> = {
      'OPERATIVO': 'bg-success',
      'EN MANTENIMIENTO': 'bg-warning text-dark',
      'EN_MANTENIMIENTO': 'bg-warning text-dark',
      'FUERA DE SERVICIO': 'bg-danger',
      'FUERA_DE_SERVICIO': 'bg-danger'
    };
    return classes[estado.toUpperCase().trim()] || 'bg-secondary';
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

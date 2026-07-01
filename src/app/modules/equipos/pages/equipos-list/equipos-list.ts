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

  // 2. Variable reactiva (Signal) para guardar el texto que el usuario escribe en tiempo real
  searchTerm = signal<string>('');

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

  // 4. Mapeamos el getter 'equipos' clásico al computed() para no romper compatibilidades
  get equipos(): Equipo[] {
    return this.filteredEquipos();
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

  // 💡 Corregido: Adaptado a las mayúsculas reales de tu base de datos de Docker
  getEstadoBadgeClass(estado: string): string {
    const classes: Record<string, string> = {
      'OPERATIVO': 'bg-success',
      'EN MANTENIMIENTO': 'bg-warning',
      'FUERA DE SERVICIO': 'bg-danger'
    };
    return classes[estado.toUpperCase()] || 'bg-secondary';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

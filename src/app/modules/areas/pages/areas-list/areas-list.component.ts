import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, signal, computed } from '@angular/core'; // 💡 Importados computed, inject y ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // OBLIGATORIO: Para habilitar el buscador con [(ngModel)]
import { ToastrService } from 'ngx-toastr';
import { AreaService } from '../../../../core/services/area.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Area } from '../../../../core/models/area.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-areas-list',
  standalone: true,
  // Añadido FormsModule para activar el buscador reactivo
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './areas-list.component.html',
  styleUrls: ['./areas-list.component.css']
})
export class AreasListComponent implements OnInit, OnDestroy {
  // 💡 Inyección de dependencias moderna sin constructor rígido
  private areaService = inject(AreaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef); // Previene atascos con el Layout elástico

  areasSignal = signal<Area[]>([]);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // 1. Variable reactiva (Signal) para guardar lo que escribe el usuario
  searchTerm = signal<string>('');

  // 2. VALIDACIÓN DE ROL REACTIVA: Evalúa de forma segura la estructura anidada del token JWT
  isAdmin = computed<boolean>(() => {
    const user = this.authService.currentUser();
    return !!(user && user.rol && user.rol.nombre && user.rol.nombre.includes('ADMIN'));
  });

  // 3.  FILTRO ULTRA VELOZ: Filtra las áreas en tiempo real sin recargar la página
  filteredAreas = computed<Area[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const listaOriginal = this.areasSignal();

    if (!term) {
      return listaOriginal; // Si el buscador está vacío, muestra todas
    }

    // Filtra dinámicamente por el nombre de la estación o por el encargado
    return listaOriginal.filter(area => 
      (area.nombre && area.nombre.toLowerCase().includes(term)) ||
      (area.encargado && area.encargado.toLowerCase().includes(term))
    );
  });

  // Mantenemos este getter clásico mapeado al computed() para dar soporte inmediato a tu HTML
  get areas(): Area[] {
    return this.filteredAreas();
  }

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.loading.set(true);
    this.cdRef.detectChanges();

    this.subscriptions.add(
      this.areaService.getAll().subscribe({
        next: (areas) => {
          this.areasSignal.set(areas); // Guardamos la respuesta en la Signal base
          this.loading.set(false);
          this.cdRef.detectChanges(); // Despierta a Angular al recibir la lista de Docker
        },
        error: () => {
          this.toastr.error('Error al cargar las áreas', 'Error');
          this.loading.set(false);
          this.cdRef.detectChanges();
        }
      })
    );
  }

  verDetalle(id: number): void {
    this.router.navigate(['/areas', id]);
  }

  editar(id: number): void {
    if (this.isAdmin()) {
      this.router.navigate(['/areas', id, 'editar']);
    } else {
      this.toastr.warning('No tiene permisos para editar áreas', 'Acceso denegado');
    }
  }

  eliminar(id: number, nombre: string): void {
    if (!this.isAdmin()) {
      this.toastr.warning('No tiene permisos para eliminar áreas', 'Acceso denegado');
      return;
    }

    if (confirm(`¿Está seguro de eliminar el área "${nombre}"?`)) {
      this.subscriptions.add(
        this.areaService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Área eliminada correctamente', 'Éxito');
            this.loadAreas(); // Recarga automática limpia
          },
          error: () => {
            this.toastr.error('Error al eliminar el área', 'Error');
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

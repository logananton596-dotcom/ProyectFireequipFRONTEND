import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, signal, computed } from '@angular/core'; // 💡 Importados computed y signal
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 💡 OBLIGATORIO: Para activar el buscador con [(ngModel)]
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AsignacionEquipoService } from '../../../../core/services/asignacion-equipo.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AsignacionEquipo } from '../../../../core/models/asignacion.model';

@Component({
  selector: 'app-asignaciones-list',
  standalone: true,
  // Añadido FormsModule para habilitar la sincronización de la caja de búsqueda
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './asignaciones-list.html',
  styleUrls: ['./asignaciones-list.css']
})
export class AsignacionesList implements OnInit, OnDestroy {
  private asignacionService = inject(AsignacionEquipoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  // 1. Guardamos la lista original del backend en una Signal base
  private asignacionesSignal = signal<AsignacionEquipo[]>([]);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // 2. Variable reactiva (Signal) para guardar lo que escribe el usuario en tiempo real
  searchTerm = signal<string>('');

  // 3. SOLUCIÓN AL ERROR: Convertimos el rol en una Signal calculada leyendo tu servicio global
  isAdmin = computed<boolean>(() => {
    const user = this.authService.currentUser();
    const roleName = user?.rol?.nombre || user?.rol?.nombre || '';
    return roleName.replace('ROLE_', '') === 'ADMIN';
  });

  // 4. FILTRO ULTRA VELOZ: Filtra las asignaciones en memoria sin tocar el servidor de Docker
  filteredAsignaciones = computed<AsignacionEquipo[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const listaOriginal = this.asignacionesSignal();

    if (!term) {
      return listaOriginal; // Si el buscador está vacío, devuelve el listado completo
    }

    // Filtra dinámicamente por código del equipo, nombre de la herramienta o el nombre del bombero
    return listaOriginal.filter(asig => 
      (asig.equipoCodigoInterno && asig.equipoCodigoInterno.toLowerCase().includes(term)) ||
      (asig.equipoNombre && asig.equipoNombre.toLowerCase().includes(term)) ||
      (asig.bomberoNombre && asig.bomberoNombre.toLowerCase().includes(term)) ||
      (asig.bomberoCodigo && asig.bomberoCodigo.toLowerCase().includes(term))
    );
  });

  // Mapeamos el getter clásico para dar soporte inmediato a tu HTML sin romper compatibilidad
  get asignaciones(): AsignacionEquipo[] {
    return this.filteredAsignaciones();
  }

  ngOnInit(): void {
    // Saneado: Eliminamos checkAdminRole() obsoleto
    this.loadAsignaciones();
  }

  loadAsignaciones(): void {
    this.loading.set(true);
    this.cdr.detectChanges();

    this.subscriptions.add(
      this.asignacionService.getAll().subscribe({
        next: (data) => {
          this.asignacionesSignal.set(data); // Guardamos la respuesta en la Signal
          this.loading.set(false);
          this.cdr.detectChanges(); // Fuerza a la tabla a adaptarse elásticamente al Sidebar
        },
        error: () => {
          this.toastr.error('Error al cargar las asignaciones', 'Error');
          this.loading.set(false);
          this.cdr.detectChanges();
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

  devolver(id: number): void {
    if (confirm('¿Está seguro de registrar la devolución de este equipo?')) {
      this.subscriptions.add(
        this.asignacionService.devolver(id).subscribe({
          next: () => {
            this.toastr.success('Devolución registrada correctamente', 'Éxito');
            this.loadAsignaciones(); // Recarga automática instantánea
          },
          error: () => {
            this.toastr.error('Error al registrar la devolución', 'Error');
            this.cdr.detectChanges();
          }
        })
      );
    }
  }

  eliminar(id: number): void {
    if (!this.isAdmin()) {
      this.toastr.warning('No tiene permisos para eliminar asignaciones', 'Acceso denegado');
      return;
    }

    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      this.subscriptions.add(
        this.asignacionService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Asignación eliminada correctamente', 'Éxito');
            this.loadAsignaciones();
          },
          error: () => {
            this.toastr.error('Error al eliminar la asignación', 'Error');
            this.cdr.detectChanges();
          }
        })
      );
    }
  }

  getEstadoTexto(asignacion: AsignacionEquipo): string {
    return asignacion.fechaHoraDevolucion ? 'DEVUELTO' : 'ACTIVO';
  }

  getEstadoBadgeClass(asignacion: AsignacionEquipo): string {
    return asignacion.fechaHoraDevolucion ? 'bg-secondary' : 'bg-success';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

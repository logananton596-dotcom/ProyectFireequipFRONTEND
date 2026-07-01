import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core'; // 💡 Importado computed
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 💡 OBLIGATORIO: Para el buscador con [(ngModel)]
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AsignacionEquipoService } from '../../../../core/services/asignacion-equipo.service';
import { AsignacionEquipo } from '../../../../core/models/asignacion.model';

@Component({
  selector: 'app-asignaciones-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // 💡 Añadido FormsModule
  templateUrl: './asignaciones-historial.html',
  styleUrls: ['./asignaciones-historial.css']
})
export class AsignacionesHistorial implements OnInit, OnDestroy {
  private asignacionService = inject(AsignacionEquipoService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  private historialSignal = signal<AsignacionEquipo[]>([]);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // 1. Variable reactiva para capturar el texto del buscador
  searchTerm = signal<string>('');

  // 2. 💡 FILTRO ULTRA VELOZ: Busca en el historial de forma inmediata por texto
  filteredHistorial = computed<AsignacionEquipo[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const listaHistorial = this.historialSignal();

    if (!term) {
      return listaHistorial;
    }

    return listaHistorial.filter(asig => 
      (asig.equipoCodigoInterno && asig.equipoCodigoInterno.toLowerCase().includes(term)) ||
      (asig.equipoNombre && asig.equipoNombre.toLowerCase().includes(term)) ||
      (asig.bomberoNombre && asig.bomberoNombre.toLowerCase().includes(term)) ||
      (asig.bomberoCodigo && asig.bomberoCodigo.toLowerCase().includes(term))
    );
  });

  // 3. Mantener propiedad 'asignaciones' para no romper compatibilidad con tu HTML
  get asignaciones(): AsignacionEquipo[] {
    return this.filteredHistorial();
  }

  ngOnInit(): void {
    this.loadHistorial();
  }

  loadHistorial(): void {
    this.loading.set(true);
    this.cdr.detectChanges();

    this.subscriptions.add(
      this.asignacionService.getAll().subscribe({
        next: (asignaciones) => {
          // Filtrar solo las que tienen fecha de devolución (historial)
          const historial = asignaciones.filter(a => a.fechaHoraDevolucion);
          this.historialSignal.set(historial);
          this.loading.set(false);
          this.cdr.detectChanges(); // Sincroniza la tabla adaptativa con el Sidebar elástico
        },
        error: () => {
          this.toastr.error('Error al cargar el historial', 'Error');
          this.loading.set(false);
          this.cdr.detectChanges();
        }
      })
    );
  }

  verDetalle(id: number): void {
    this.router.navigate(['/asignaciones', id]);
  }

  getEstadoBadgeClass(asignacion: AsignacionEquipo): string {
    return 'bg-secondary';
  }

  getEstadoTexto(asignacion: AsignacionEquipo): string {
    return 'DEVUELTO';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

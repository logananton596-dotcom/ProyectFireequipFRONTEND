import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { Mantenimiento } from '../../../../core/models/mantenimiento.model';

@Component({
  selector: 'app-mantenimiento-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mantenimiento-historial.html',
  styleUrls: ['./mantenimiento-historial.css']
})
export class MantenimientoHistorial implements OnInit, OnDestroy {
  private mantenimientoService = inject(MantenimientoService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  mantenimientos = signal<Mantenimiento[]>([]);
  loading = signal(false);
  searchTerm = signal('');

  // ✅ Regla 4: Filtro en tiempo real
  filteredMantenimientos = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.mantenimientos();
    }
    return this.mantenimientos().filter(item =>
      (item.equipoNombre?.toLowerCase().includes(term) ?? false) ||
      (item.equipoCodigoInterno?.toLowerCase().includes(term) ?? false) ||
      (item.tipo?.toLowerCase().includes(term) ?? false) ||
      (item.responsable?.toLowerCase().includes(term) ?? false)
    );
  });

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.loadHistorial();
  }

  loadHistorial(): void {
    this.loading.set(true);
    this.subscriptions.add(
      this.mantenimientoService.getAll().subscribe({
        next: (items) => {
          // Filtrar mantenimientos completados (con fechaFin)
          const historial = items.filter(item => item.fechaFin);
          this.mantenimientos.set(historial);
          this.loading.set(false);
          this.cdr.detectChanges();
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
    if (id) {
      this.router.navigate(['/mantenimientos', id]);
    }
  }

  getTipoBadgeClass(tipo: string): string {
    const classes: Record<string, string> = {
      'PREVENTIVO': 'bg-info',
      'CORRECTIVO': 'bg-warning'
    };
    return classes[tipo] || 'bg-secondary';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
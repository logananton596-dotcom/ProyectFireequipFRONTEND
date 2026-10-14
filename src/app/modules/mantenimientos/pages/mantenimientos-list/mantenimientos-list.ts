import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Mantenimiento } from '../../../../core/models/mantenimiento.model';

@Component({
  selector: 'app-mantenimientos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mantenimientos-list.html',
  styleUrls: ['./mantenimientos-list.css']
})
export class MantenimientosList implements OnInit, OnDestroy {
  private mantenimientoService = inject(MantenimientoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  //  Regla 1: computed para roles
  isAdmin = computed(() => this.authService.currentUser()?.rol?.nombre?.includes('ADMIN') ?? false);

  mantenimientos = signal<Mantenimiento[]>([]);
  loading = signal(false);
  searchTerm = signal(''); // Regla 4: buscador

  // Regla 4: Signal calculada para filtrado
  filteredMantenimientos = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.mantenimientos();
    }
    return this.mantenimientos().filter(item =>
      (item.equipoNombre?.toLowerCase().includes(term) ?? false) ||
      (item.equipoCodigoInterno?.toLowerCase().includes(term) ?? false) ||
      (item.tipo?.toLowerCase().includes(term) ?? false) ||
      (item.responsable?.toLowerCase().includes(term) ?? false) ||
      (item.descripcion?.toLowerCase().includes(term) ?? false)
    );
  });

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.loadMantenimientos();
  }

  loadMantenimientos(): void {
    this.loading.set(true);
    this.subscriptions.add(
      this.mantenimientoService.getAll().subscribe({
        next: (items) => {
          this.mantenimientos.set(items);
          this.loading.set(false);
          this.cdr.detectChanges(); // ✅ Regla 2
        },
        error: () => {
          this.toastr.error('Error al cargar los mantenimientos', 'Error');
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

  editar(id: number): void {
    if (id && this.isAdmin()) {
      this.router.navigate(['/mantenimientos', id, 'editar']);
    } else if (!this.isAdmin()) {
      this.toastr.warning('No tiene permisos para editar mantenimientos', 'Acceso denegado');
    }
  }

  eliminar(id: number): void {
    if (!this.isAdmin()) {
      this.toastr.warning('No tiene permisos para eliminar mantenimientos', 'Acceso denegado');
      return;
    }

    if (id && confirm('¿Está seguro de eliminar este mantenimiento?')) {
      this.subscriptions.add(
        this.mantenimientoService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Mantenimiento eliminado correctamente', 'Éxito');
            this.loadMantenimientos();
          },
          error: () => {
            this.toastr.error('Error al eliminar el mantenimiento', 'Error');
          }
        })
      );
    }
  }

  getTipoBadgeClass(tipo: string): string {
    const classes: Record<string, string> = {
      'PREVENTIVO': 'bg-info',
      'CORRECTIVO': 'bg-warning'
    };
    return classes[tipo] || 'bg-secondary';
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'PREVENTIVO': 'bi bi-calendar-check',
      'CORRECTIVO': 'bi bi-wrench'
    };
    return icons[tipo] || 'bi bi-tools';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
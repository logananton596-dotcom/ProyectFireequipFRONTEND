import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CasilleroService } from '../../../../core/services/casillero.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { 
  Casillero, 
  getEstadoCasilleroBadgeClass, 
  formatearEstadoCasillero,
  getAsignacionBadgeClass,
  formatearAsignacion
} from '../../../../core/models/casillero.model';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-casillero-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './casillero-detail.component.html',
  styleUrls: ['./casillero-detail.component.css']
})
export class CasilleroDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private casilleroService = inject(CasilleroService);
  private bomberoService = inject(BomberoService);
  private toastr = inject(ToastrService);

  casillero = signal<Casillero | null>(null);
  bombero = signal<Bombero | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // Helpers
  getEstadoCasilleroBadgeClass = getEstadoCasilleroBadgeClass;
  formatearEstadoCasillero = formatearEstadoCasillero;
  getAsignacionBadgeClass = getAsignacionBadgeClass;
  formatearAsignacion = formatearAsignacion;

  ngOnInit(): void {
    this.loadCasillero();
  }

  loadCasillero(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/casilleros']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.casilleroService.getById(id).subscribe({
        next: (casillero) => {
          this.casillero.set(casillero);
          if (casillero.bomberoId) {
            this.cargarBombero(casillero.bomberoId);
          }
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el casillero', 'Error');
          this.loading.set(false);
          this.router.navigate(['/casilleros']);
        }
      })
    );
  }

  private cargarBombero(bomberoId: number): void {
    this.subscriptions.add(
      this.bomberoService.getById(bomberoId).subscribe({
        next: (bombero) => this.bombero.set(bombero),
        error: () => this.bombero.set(null)
      })
    );
  }

  editar(): void {
    const casillero = this.casillero();
    if (casillero?.id) {
      this.router.navigate(['/casilleros', casillero.id, 'editar']);
    }
  }

  eliminar(): void {
    const casillero = this.casillero();
    if (!casillero) return;

    if (confirm(`¿Está seguro de eliminar el casillero "${casillero.numero}"?`)) {
      this.subscriptions.add(
        this.casilleroService.deleteById(casillero.id!).subscribe({
          next: () => {
            this.toastr.success('Casillero eliminado correctamente', 'Éxito');
            this.router.navigate(['/casilleros']);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando el casillero', 'Error');
          }
        })
      );
    }
  }

  cambiarEstado(): void {
    const casillero = this.casillero();
    if (!casillero) return;

    const nuevoEstado = !casillero.activo;
    const accion = nuevoEstado ? 'activar' : 'inactivar';

    if (confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} el casillero "${casillero.numero}"?`)) {
      this.subscriptions.add(
        this.casilleroService.cambiarEstado(casillero.id!, nuevoEstado).subscribe({
          next: () => {
            this.toastr.success(`Casillero ${nuevoEstado ? 'activado' : 'inactivado'} correctamente`, 'Éxito');
            this.loadCasillero();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
          }
        })
      );
    }
  }

  liberar(): void {
    const casillero = this.casillero();
    if (!casillero || !casillero.bomberoId) return;

    if (confirm(`¿Liberar el casillero "${casillero.numero}" del bombero ${this.getBomberoDisplay()}?`)) {
      this.subscriptions.add(
        this.casilleroService.liberar(casillero.id!).subscribe({
          next: () => {
            this.toastr.success('Casillero liberado correctamente', 'Éxito');
            this.loadCasillero();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al liberar el casillero', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/casilleros']);
  }

  getBomberoDisplay(): string {
    const b = this.bombero();
    if (!b) return 'N/A';
    return `${b.nombre} ${b.apellido} (${b.codigoCgbvp})`;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
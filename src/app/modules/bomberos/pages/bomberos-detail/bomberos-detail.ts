import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Bombero, EstadoBombero, formatearTipoSangre,formatearCompania,formatearTipoLicencia,formatearTipoVehiculo } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bomberos-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bomberos-detail.html',
  styleUrls: ['./bomberos-detail.css']
})
export class BomberosDetail implements OnInit, OnDestroy {
  // Inyección moderna
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bomberoService = inject(BomberoService);
  private toastr = inject(ToastrService);

  // Signals
  bombero = signal<Bombero | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();


  //helpers
  formatearCompania = formatearCompania;
  formatearTipoVehiculo = formatearTipoVehiculo;
  formatearTipoLicencia = formatearTipoLicencia;

  ngOnInit(): void {
    this.loadBombero();
  }

  loadBombero(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/bomberos']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.bomberoService.getById(id).subscribe({
        next: (bombero) => {
          this.bombero.set(bombero);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el bombero', 'Error');
          this.loading.set(false);
          this.router.navigate(['/bomberos']);
        }
      })
    );
  }

  editar(): void {
    const bombero = this.bombero();
    if (bombero?.id) {
      this.router.navigate(['/bomberos', bombero.id, 'editar']);
    }
  }

  eliminar(): void {
    const bombero = this.bombero();
    if (!bombero) return;
    const nombreCompleto = this.getNombreCompleto(bombero);
    if (confirm(`¿Está seguro de eliminar al bombero "${nombreCompleto}"?`)) {
      this.subscriptions.add(
        this.bomberoService.deleteById(bombero.id!).subscribe({
          next: () => {
            this.toastr.success('Bombero eliminado correctamente', 'Éxito');
            this.router.navigate(['/bomberos']);
          },
          error: () => {
            this.toastr.error('Error eliminando el bombero', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/bomberos']);
  }

  // Helper para nombre completo
  getNombreCompleto(bombero: Bombero): string {
    return `${bombero.apellido}, ${bombero.nombre}`;
  }
  // Helper para formatear tipo de cargo
  formatearTipoCargo(tipo: string): string {
  return tipo ? tipo.replace('_', ' ') : 'N/A';
  }

formatFecha(date: Date | string | null | undefined): string { // <-- Agregado 'null' aquí
  if (!date) return 'N/A';
  
  const d = new Date(date);
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

  // Badge para estado usando Enum
  getEstadoBadgeClass(estado: EstadoBombero): string {
    switch (estado) {
      case 'ACTIVO': return 'bg-success text-white';
      case 'RESERVA': return 'bg-warning text-dark';
      case 'BAJA': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }  
  formatearTipoSangre = formatearTipoSangre;

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OficinaService } from '../../../../core/services/oficina.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Oficina, getEstadoOficinaBadgeClass, formatearEstadoOficina } from '../../../../core/models/oficina.model';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-oficina-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oficina-detail.component.html',
  styleUrls: ['./oficina-detail.component.css']
})
export class OficinaDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oficinaService = inject(OficinaService);
  private bomberoService = inject(BomberoService);
  private toastr = inject(ToastrService);

  oficina = signal<Oficina | null>(null);
  responsable = signal<Bombero | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // Helpers
  getEstadoOficinaBadgeClass = getEstadoOficinaBadgeClass;
  formatearEstadoOficina = formatearEstadoOficina;

  ngOnInit(): void {
    this.loadOficina();
  }

  loadOficina(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/oficinas']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.oficinaService.getById(id).subscribe({
        next: (oficina) => {
          this.oficina.set(oficina);
          if (oficina.responsableId) {
            this.cargarResponsable(oficina.responsableId);
          }
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando la oficina', 'Error');
          this.loading.set(false);
          this.router.navigate(['/oficinas']);
        }
      })
    );
  }

  private cargarResponsable(responsableId: number): void {
    this.subscriptions.add(
      this.bomberoService.getById(responsableId).subscribe({
        next: (bombero) => this.responsable.set(bombero),
        error: () => this.responsable.set(null)
      })
    );
  }

  editar(): void {
    const oficina = this.oficina();
    if (oficina?.id) {
      this.router.navigate(['/oficinas', oficina.id, 'editar']);
    }
  }

  eliminar(): void {
    const oficina = this.oficina();
    if (!oficina) return;

    if (confirm(`¿Está seguro de eliminar la oficina "${oficina.nombre}"?`)) {
      this.subscriptions.add(
        this.oficinaService.deleteById(oficina.id!).subscribe({
          next: () => {
            this.toastr.success('Oficina eliminada correctamente', 'Éxito');
            this.router.navigate(['/oficinas']);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando la oficina', 'Error');
          }
        })
      );
    }
  }

  cambiarEstado(): void {
    const oficina = this.oficina();
    if (!oficina) return;

    const nuevoEstado = !oficina.activo;
    const accion = nuevoEstado ? 'activar' : 'inactivar';

    if (confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} la oficina "${oficina.nombre}"?`)) {
      this.subscriptions.add(
        this.oficinaService.cambiarEstado(oficina.id!, nuevoEstado).subscribe({
          next: () => {
            this.toastr.success(`Oficina ${nuevoEstado ? 'activada' : 'inactivada'} correctamente`, 'Éxito');
            this.loadOficina();
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error al cambiar estado', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/oficinas']);
  }

  getResponsableDisplay(): string {
    const resp = this.responsable();
    if (!resp) return 'N/A';
    return `${resp.nombre} ${resp.apellido} (${resp.codigoCgbvp})`;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BienService } from '../../../../core/services/bien.service';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import {
  Bien,
  formatearTipoBien,
  formatearEstadoBien,
  formatearCondicionBien,
  getEstadoBienBadgeClass,
  getCondicionBienBadgeClass
} from '../../../../core/models/bien.model';
import { Ubicacion, getUbicacionDisplay } from '../../../../core/models/ubicacion.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bien-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bien-detail.component.html',
  styleUrls: ['./bien-detail.component.css']
})
export class BienDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bienService = inject(BienService);
  private ubicacionService = inject(UbicacionService);
  private toastr = inject(ToastrService);

  bien = signal<Bien | null>(null);
  ubicacion = signal<Ubicacion | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // Helpers
  formatearTipoBien = formatearTipoBien;
  formatearEstadoBien = formatearEstadoBien;
  formatearCondicionBien = formatearCondicionBien;
  getEstadoBienBadgeClass = getEstadoBienBadgeClass;
  getCondicionBienBadgeClass = getCondicionBienBadgeClass;
  getUbicacionDisplay = getUbicacionDisplay;

  ngOnInit(): void {
    this.loadBien();
  }

  loadBien(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/bienes']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.bienService.getById(id).subscribe({
        next: (bien) => {
          this.bien.set(bien);
          this.cargarUbicacion(bien.ubicacionId);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el bien', 'Error');
          this.loading.set(false);
          this.router.navigate(['/bienes']);
        }
      })
    );
  }

  private cargarUbicacion(ubicacionId: number): void {
    this.subscriptions.add(
      this.ubicacionService.getById(ubicacionId).subscribe({
        next: (ubicacion) => this.ubicacion.set(ubicacion),
        error: () => this.ubicacion.set(null)
      })
    );
  }

  // Formatear fecha
  formatFecha(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Acciones
  editar(): void {
    const bien = this.bien();
    if (bien?.id) {
      this.router.navigate(['/bienes', bien.id, 'editar']);
    }
  }

  eliminar(): void {
    const bien = this.bien();
    if (!bien) return;

    if (confirm(`¿Está seguro de eliminar el bien "${bien.nombre}"?`)) {
      this.subscriptions.add(
        this.bienService.deleteById(bien.id!).subscribe({
          next: () => {
            this.toastr.success('Bien eliminado correctamente', 'Éxito');
            this.router.navigate(['/bienes']);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error eliminando el bien', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/bienes']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
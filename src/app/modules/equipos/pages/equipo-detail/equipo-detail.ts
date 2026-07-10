import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EquipoService } from '../../../../core/services/equipo.service';
import { Equipo } from '../../../../core/models/equipo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-equipo-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipo-detail.html',
  styleUrls: ['./equipo-detail.css']
})
export class EquipoDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private equipoService = inject(EquipoService);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef); // CORREGIDO: Inyectar detector de cambios

  equipo: Equipo | null = null;
  loading = false;
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.loadEquipo();
  }

  loadEquipo(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/equipos']);
      return;
    }

    this.loading = true;
    this.cdRef.detectChanges(); // Forzar animación de cargando en la interfaz

    this.subscriptions.add(
      this.equipoService.getById(id).subscribe({
        next: (equipo) => {
          this.equipo = equipo;
          this.loading = false;
          this.cdRef.detectChanges(); // Forzar actualización de la interfaz después de cargar el equipo
        },
        error: (error) => {
          console.error('Error cargando equipo:', error);
          this.toastr.error('Error cargando el equipo', 'Error');
          this.loading = false;
          this.cdRef.detectChanges(); // Forzar actualización de la interfaz en caso de error
          this.router.navigate(['/equipos']);
        }
      })
    );
  }

  editar(): void {
    if (this.equipo?.id) {
      this.router.navigate(['/equipos', this.equipo.id, 'editar']);
    }
  }

  eliminar(): void {
    if (!this.equipo) return;
    if (confirm(`¿Está seguro de eliminar el equipo "${this.equipo.nombre}"?`)) {
      this.subscriptions.add(
        this.equipoService.deleteById(this.equipo!.id!).subscribe({
          next: () => {
            this.toastr.success('Equipo eliminado correctamente', 'Éxito');
            this.router.navigate(['/equipos']);
          },
          error: () => {
            this.toastr.error('Error eliminando el equipo', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/equipos']);
  }

  getEstadoBadgeClass(estado: string): string {
    if (!estado) return 'bg-secondary';
    switch (estado.toUpperCase().trim()) {
      case 'OPERATIVO':
        return 'bg-success text-white';
      case 'EN MANTENIMIENTO':
      case 'EN_MANTENIMIENTO':
        return 'bg-warning text-dark';
      case 'FUERA DE SERVICIO':
      case 'FUERA_DE_SERVICIO':
      case 'DADO_BAJA':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
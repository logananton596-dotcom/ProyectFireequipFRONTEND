import { Component, OnInit, OnDestroy } from '@angular/core';
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
  equipo: Equipo | null = null;
  loading = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipoService: EquipoService,
    private toastr: ToastrService
  ) {}

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
    this.subscriptions.add(
      this.equipoService.getById(id).subscribe({
        next: (equipo) => {
          this.equipo = equipo;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando equipo:', error);
          this.toastr.error('Error cargando el equipo', 'Error');
          this.loading = false;
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
    const classes: Record<string, string> = {
      'Operativo': 'bg-success',
      'En Mantenimiento': 'bg-warning',
      'Fuera de Servicio': 'bg-danger'
    };
    return classes[estado] || 'bg-secondary';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
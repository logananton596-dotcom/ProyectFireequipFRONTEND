import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bomberos-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bomberos-detail.html',
  styleUrls: ['./bomberos-detail.css']
})
export class BomberosDetail implements OnInit, OnDestroy {
  bombero = signal<Bombero | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bomberoService: BomberoService,
    private toastr: ToastrService
  ) {}

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
    if (confirm(`¿Está seguro de eliminar al bombero "${bombero.nombre}"?`)) {
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

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'bg-success' : 'bg-danger';
  }

  getEstadoTexto(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
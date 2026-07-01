import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bomberos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bomberos-list.html',
  styleUrls: ['./bomberos-list.css']
})
export class BomberosList implements OnInit, OnDestroy {
  bomberos = signal<Bombero[]>([]);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  constructor(
    private bomberoService: BomberoService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBomberos();
  }

  loadBomberos(): void {
    this.loading.set(true);
    this.subscriptions.add(
      this.bomberoService.getAll().subscribe({
        next: (bomberos) => {
          this.bomberos.set(bomberos);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error al cargar los bomberos', 'Error');
          this.loading.set(false);
        }
      })
    );
  }

  verDetalle(id: number): void {
    this.router.navigate(['/bomberos', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/bomberos', id, 'editar']);
  }

  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar al bombero "${nombre}"?`)) {
      this.subscriptions.add(
        this.bomberoService.deleteById(id).subscribe({
          next: () => {
            this.toastr.success('Bombero eliminado correctamente', 'Éxito');
            this.loadBomberos();
          },
          error: () => {
            this.toastr.error('Error al eliminar el bombero', 'Error');
          }
        })
      );
    }
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
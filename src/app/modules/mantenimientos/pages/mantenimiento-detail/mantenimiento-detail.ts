import { Component } from '@angular/core';
import {  OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Mantenimiento } from '../../../../core/models/mantenimiento.model';

@Component({
  selector: 'app-mantenimiento-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mantenimiento-detail.html',
  styleUrls: ['./mantenimiento-detail.css']
})
export class MantenimientoDetail implements OnInit, OnDestroy {
  private mantenimientoService = inject(MantenimientoService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  // Regla 1: computed para roles
  isAdmin = computed(() => this.authService.currentUser()?.rol?.nombre?.includes('ADMIN') ?? false);

  mantenimiento = signal<Mantenimiento | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.loadMantenimiento();
  }

  loadMantenimiento(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/mantenimientos']);
      return;
    }

    this.loading.set(true);
    this.subscriptions.add(
      this.mantenimientoService.getById(id).subscribe({
        next: (item) => {
          this.mantenimiento.set(item);
          this.loading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastr.error('Error cargando el mantenimiento', 'Error');
          this.loading.set(false);
          this.router.navigate(['/mantenimientos']);
          this.cdr.detectChanges();
        }
      })
    );
  }

  editar(): void {
    const item = this.mantenimiento();
    if (item?.id && this.isAdmin()) {
      this.router.navigate(['/mantenimientos', item.id, 'editar']);
    } else if (!this.isAdmin()) {
      this.toastr.warning('No tiene permisos para editar mantenimientos', 'Acceso denegado');
    }
  }

  eliminar(): void {
    const item = this.mantenimiento();
    if (!item) return;

    if (!this.isAdmin()) {
      this.toastr.warning('No tiene permisos para eliminar mantenimientos', 'Acceso denegado');
      return;
    }

    if (item.id && confirm('¿Está seguro de eliminar este mantenimiento?')) {
      this.subscriptions.add(
        this.mantenimientoService.deleteById(item.id).subscribe({
          next: () => {
            this.toastr.success('Mantenimiento eliminado correctamente', 'Éxito');
            this.router.navigate(['/mantenimientos']);
          },
          error: () => {
            this.toastr.error('Error eliminando el mantenimiento', 'Error');
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/mantenimientos']);
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
import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core'; // 💡 Importado computed
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // 💡 Añadido RouterLink
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AsignacionEquipoService } from '../../../../core/services/asignacion-equipo.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AsignacionEquipo } from '../../../../core/models/asignacion.model';

@Component({
  selector: 'app-asignacion-detail',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './asignacion-detail.html',
  styleUrls: ['./asignacion-detail.css']
})
export class AsignacionDetail implements OnInit, OnDestroy {
  private asignacionService = inject(AsignacionEquipoService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  asignacion = signal<AsignacionEquipo | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // 💡 1. SOLUCIÓN AL ERROR: Usamos computed reactivo leyendo la Signal global. 
  // Limpiamos el prefijo 'ROLE_' de la DB si es necesario.
  isAdmin = computed<boolean>(() => {
    const user = this.authService.currentUser();
    return !!(user && user.rol?.nombre?.replace('ROLE_', '') === 'ADMIN' || user?.rol?.nombre?.replace('ROLE_', '') === 'ADMIN');
  });

  ngOnInit(): void {
    // 💡 2. Eliminamos la función obsoleta checkAdminRole() que causaba el error
    this.loadAsignacion();
  }

  loadAsignacion(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/asignaciones']);
      return;
    }

    this.loading.set(true);
    this.cdr.detectChanges();

    this.subscriptions.add(
      this.asignacionService.getById(id).subscribe({
        next: (asignacion) => {
          this.asignacion.set(asignacion);
          this.loading.set(false);
          this.cdr.detectChanges(); // 💡 Despierta a Angular al recibir la respuesta asíncrona de Docker
        },
        error: () => {
          this.toastr.error('Error cargando la asignación', 'Error');
          this.loading.set(false);
          this.cdr.detectChanges();
          this.router.navigate(['/asignaciones']);
        }
      })
    );
  }

  editar(): void {
    const asignacion = this.asignacion();
    if (asignacion?.id) {
      this.router.navigate(['/asignaciones', asignacion.id, 'editar']);
    }
  }

  devolver(): void {
    const asignacion = this.asignacion();
    if (!asignacion) return;

    if (asignacion.fechaHoraDevolucion) {
      this.toastr.warning('Este equipo ya fue devuelto', 'Aviso');
      return;
    }

    if (confirm('¿Está seguro de registrar la devolución de este equipo?')) {
      this.subscriptions.add(
        this.asignacionService.devolver(asignacion.id!).subscribe({
          next: () => {
            this.toastr.success('Devolución registrada correctamente', 'Éxito');
            this.loadAsignacion(); // Recarga y actualiza de inmediato
          },
          error: () => {
            this.toastr.error('Error al registrar la devolución', 'Error');
            this.cdr.detectChanges();
          }
        })
      );
    }
  }

  eliminar(): void {
    const asignacion = this.asignacion();
    if (!asignacion) return;

    if (!this.isAdmin()) {
      this.toastr.warning('No tiene permisos para eliminar asignaciones', 'Acceso denegado');
      return;
    }

    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      this.subscriptions.add(
        this.asignacionService.deleteById(asignacion.id!).subscribe({
          next: () => {
            this.toastr.success('Asignación eliminada correctamente', 'Éxito');
            this.router.navigate(['/asignaciones']);
          },
          error: () => {
            this.toastr.error('Error eliminando la asignación', 'Error');
            this.cdr.detectChanges();
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/asignaciones']);
  }

  getEstadoTexto(asignacion: AsignacionEquipo): string {
    return asignacion.fechaHoraDevolucion ? 'DEVUELTO' : 'ACTIVO';
  }

  getEstadoBadgeClass(asignacion: AsignacionEquipo): string {
    return asignacion.fechaHoraDevolucion ? 'bg-secondary' : 'bg-success';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

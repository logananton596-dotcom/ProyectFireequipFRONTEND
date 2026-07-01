import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core'; // 💡 Importados inject, computed y ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AreaService } from '../../../../core/services/area.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Area } from '../../../../core/models/area.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-areas-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './areas-detail.html',
  styleUrls: ['./areas-detail.css']
})
export class AreasDetail implements OnInit, OnDestroy {
  // 1. Inyección de dependencias moderna con inject()
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private areaService = inject(AreaService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef); // Previene congelamientos con la barra lateral

  area = signal<Area | null>(null);
  loading = signal(false);
  private subscriptions: Subscription = new Subscription();

  // 2. En lugar de una variable y un subscribe manual, usamos un computed() reactivo ultra seguro
  isAdmin = computed<boolean>(() => {
    const user = this.authService.currentUser();
    // Validamos de forma segura la estructura anidada de tu base de datos de Docker
    return !!(user && user.rol && user.rol.nombre && user.rol.nombre.includes('ADMIN'));
  });

  ngOnInit(): void {
    this.loadArea();
  }

  loadArea(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/areas']);
      return;
    }

    this.loading.set(true);
    this.cdRef.detectChanges();

    this.subscriptions.add(
      this.areaService.getById(id).subscribe({
        next: (area) => {
          this.area.set(area);
          this.loading.set(false);
          this.cdRef.detectChanges(); //  3. Despierta a Angular al recibir la respuesta asíncrona de Docker
        },
        error: () => {
          this.toastr.error('Error cargando el área', 'Error');
          this.loading.set(false);
          this.cdRef.detectChanges();
          this.router.navigate(['/areas']);
        }
      })
    );
  }

  editar(): void {
    const area = this.area();
    if (area?.id && this.isAdmin()) {
      this.router.navigate(['/areas', area.id, 'editar']);
    } else {
      this.toastr.warning('No tiene permisos para editar áreas', 'Acceso denegado');
    }
  }

  eliminar(): void {
    const area = this.area();
    if (!area) return;

    if (!this.isAdmin()) {
      this.toastr.warning('No tiene permisos para eliminar áreas', 'Acceso denegado');
      return;
    }

    if (confirm(`¿Está seguro de eliminar el área "${area.nombre}"?`)) {
      this.subscriptions.add(
        this.areaService.deleteById(area.id!).subscribe({
          next: () => {
            this.toastr.success('Área eliminada correctamente', 'Éxito');
            this.router.navigate(['/areas']);
          },
          error: () => {
            this.toastr.error('Error eliminando el área', 'Error');
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  volver(): void {
    this.router.navigate(['/areas']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OficinaService } from '../../../../core/services/oficina.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-oficina-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './oficina-form.component.html',
  styleUrls: ['./oficina-form.component.css']
})
export class OficinaFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private oficinaService = inject(OficinaService);
  private bomberoService = inject(BomberoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  oficinaId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  bomberos: Bombero[] = [];

  private subscriptions: Subscription = new Subscription();

  // Formulario
  oficinaForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(200)],
    piso: ['', Validators.maxLength(50)],
    edificio: ['', Validators.maxLength(100)],
    capacidad: ['', [Validators.min(0)]],
    responsableId: [null],
    activo: [true],
    observaciones: ['', Validators.maxLength(500)]
  });

  ngOnInit(): void {
    this.cargarBomberos();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.oficinaId = Number(params['id']);
        this.loadOficina();
      }
    });
  }

  private cargarBomberos(): void {
    this.subscriptions.add(
      this.bomberoService.getActivos().subscribe({
        next: (data) => {
          this.bomberos = data;
        },
        error: () => {
          this.toastr.error('Error cargando bomberos', 'Error');
        }
      })
    );
  }

  loadOficina(): void {
    if (!this.oficinaId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.oficinaService.getById(this.oficinaId).subscribe({
        next: (oficina) => {
          this.oficinaForm.patchValue({
            codigo: oficina.codigo,
            nombre: oficina.nombre,
            descripcion: oficina.descripcion || '',
            piso: oficina.piso || '',
            edificio: oficina.edificio || '',
            capacidad: oficina.capacidad || '',
            responsableId: oficina.responsableId || null,
            activo: oficina.activo,
            observaciones: oficina.observaciones || ''
          });
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

  getBomberoDisplay(bombero: Bombero): string {
    return `${bombero.codigoCgbvp} - ${bombero.grado} ${bombero.nombre} ${bombero.apellido}`;
  }

  onSubmit(): void {
    if (this.oficinaForm.invalid) {
      this.oficinaForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.oficinaForm.value;

    if (this.isEditMode() && this.oficinaId) {
      this.subscriptions.add(
        this.oficinaService.update(this.oficinaId, formValue).subscribe({
          next: () => {
            this.toastr.success('Oficina actualizada correctamente', 'Éxito');
            this.router.navigate(['/oficinas', this.oficinaId]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error actualizando la oficina', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.oficinaService.create(formValue).subscribe({
          next: (oficina) => {
            this.toastr.success('Oficina creada correctamente', 'Éxito');
            this.router.navigate(['/oficinas', oficina.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error creando la oficina', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.oficinaId) {
      this.router.navigate(['/oficinas', this.oficinaId]);
    } else {
      this.router.navigate(['/oficinas']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
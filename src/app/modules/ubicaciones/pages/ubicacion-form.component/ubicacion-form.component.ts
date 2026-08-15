// src/app/modules/ubicaciones/pages/ubicacion-form/ubicacion-form.component.ts

import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import { NOMBRES_UBICACION, ESTADOS_UBICACION, formatearNombreUbicacion } from '../../../../core/models/ubicacion.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ubicacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ubicacion-form.component.html',
  styleUrls: ['./ubicacion-form.component.css']
})
export class UbicacionFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private ubicacionService = inject(UbicacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  ubicacionId: number | null = null;
  loading = signal(false);
  submitting = signal(false);

  private subscriptions: Subscription = new Subscription();

  // Enums y helpers
  nombresUbicacion = NOMBRES_UBICACION;
  estadosUbicacion = ESTADOS_UBICACION;
  formatearNombreUbicacion = formatearNombreUbicacion;

  // Formulario
  ubicacionForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(30)]],
    nombreUbicacion: ['', [Validators.required]],
    estado: ['ACTIVA', [Validators.required]],
    observacion: ['', Validators.maxLength(300)],
    activa: [true, Validators.required]
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.ubicacionId = Number(params['id']);
        this.loadUbicacion();
      }
    });
  }

  loadUbicacion(): void {
    if (!this.ubicacionId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.ubicacionService.getById(this.ubicacionId).subscribe({
        next: (ubicacion) => {
          this.ubicacionForm.patchValue({
            codigo: ubicacion.codigo,
            nombreUbicacion: ubicacion.nombreUbicacion,
            estado: ubicacion.estado,
            observacion: ubicacion.observacion || '',
            activa: ubicacion.activa
          });
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando la ubicación', 'Error');
          this.loading.set(false);
          this.router.navigate(['/ubicaciones']);
        }
      })
    );
  }

  onSubmit(): void {
    if (this.ubicacionForm.invalid) {
      this.ubicacionForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.ubicacionForm.value;

    if (this.isEditMode() && this.ubicacionId) {
      this.subscriptions.add(
        this.ubicacionService.update(this.ubicacionId, formValue).subscribe({
          next: () => {
            this.toastr.success('Ubicación actualizada correctamente', 'Éxito');
            this.router.navigate(['/ubicaciones', this.ubicacionId]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error actualizando la ubicación', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.ubicacionService.create(formValue).subscribe({
          next: (ubicacion) => {
            this.toastr.success('Ubicación creada correctamente', 'Éxito');
            this.router.navigate(['/ubicaciones', ubicacion.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error creando la ubicación', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.ubicacionId) {
      this.router.navigate(['/ubicaciones', this.ubicacionId]);
    } else {
      this.router.navigate(['/ubicaciones']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
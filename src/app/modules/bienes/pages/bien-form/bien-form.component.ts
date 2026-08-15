// src/app/modules/bienes/pages/bien-form/bien-form.component.ts

import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BienService } from '../../../../core/services/bien.service';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import {
  TIPOS_BIEN,
  ESTADOS_BIEN,
  CONDICIONES_BIEN,
  formatearTipoBien,
  formatearEstadoBien,
  formatearCondicionBien
} from '../../../../core/models/bien.model';
import { NOMBRES_AREA, formatearNombreArea } from '../../../../core/models/area.model';
import { Ubicacion, getUbicacionDisplay } from '../../../../core/models/ubicacion.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bien-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bien-form.component.html',
  styleUrls: ['./bien-form.component.css']
})
export class BienFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private bienService = inject(BienService);
  private ubicacionService = inject(UbicacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  bienId: number | null = null;
  loading = signal(false);
  submitting = signal(false);

  private subscriptions: Subscription = new Subscription();

  // Enums
  tiposBien = TIPOS_BIEN;
  estadosBien = ESTADOS_BIEN;
  condicionesBien = CONDICIONES_BIEN;
  nombresArea = NOMBRES_AREA;

  // Helpers
  formatearTipoBien = formatearTipoBien;
  formatearEstadoBien = formatearEstadoBien;
  formatearCondicionBien = formatearCondicionBien;
  formatearNombreArea = formatearNombreArea;
  getUbicacionDisplay = getUbicacionDisplay;

  // Ubicaciones disponibles
  ubicaciones: Ubicacion[] = [];

  // Formulario
  bienForm: FormGroup = this.fb.group({
    codigoCgbvp: ['', [Validators.required, Validators.maxLength(30)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    tipoBien: ['', Validators.required],
    marca: ['', Validators.maxLength(80)],
    modelo: ['', Validators.maxLength(80)],
    numeroSerie: ['', Validators.maxLength(80)],
    fechaAdquisicion: ['', Validators.required],
    estado: ['', Validators.required],
    condicion: [''],
    valorReferencial: ['', Validators.min(0)],
    especificaciones: ['', Validators.maxLength(1000)],
    observaciones: ['', Validators.maxLength(500)],
    area: ['', Validators.required],
    ubicacionId: ['', Validators.required],
    activo: [true]
  });

  ngOnInit(): void {
    this.cargarUbicaciones();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.bienId = Number(params['id']);
        this.loadBien();
      }
    });
  }

  private cargarUbicaciones(): void {
    this.subscriptions.add(
      this.ubicacionService.getActivas().subscribe({
        next: (ubicaciones) => {
          this.ubicaciones = ubicaciones;
        },
        error: () => {
          this.toastr.error('Error cargando ubicaciones', 'Error');
        }
      })
    );
  }

  loadBien(): void {
    if (!this.bienId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.bienService.getById(this.bienId).subscribe({
        next: (bien) => {
          this.bienForm.patchValue({
            codigoCgbvp: bien.codigoCgbvp,
            nombre: bien.nombre,
            tipoBien: bien.tipoBien,
            marca: bien.marca || '',
            modelo: bien.modelo || '',
            numeroSerie: bien.numeroSerie || '',
            fechaAdquisicion: this.formatDateForInput(bien.fechaAdquisicion),
            estado: bien.estado,
            condicion: bien.condicion || '',
            valorReferencial: bien.valorReferencial || '',
            especificaciones: bien.especificaciones || '',
            observaciones: bien.observaciones || '',
            area: bien.area,
            ubicacionId: bien.ubicacionId,
            activo: bien.activo
          });
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

  private formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.bienForm.invalid) {
      this.bienForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.bienForm.value;

    if (this.isEditMode() && this.bienId) {
      this.subscriptions.add(
        this.bienService.update(this.bienId, formValue).subscribe({
          next: () => {
            this.toastr.success('Bien actualizado correctamente', 'Éxito');
            this.router.navigate(['/bienes', this.bienId]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error actualizando el bien', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.bienService.create(formValue).subscribe({
          next: (bien) => {
            this.toastr.success('Bien creado correctamente', 'Éxito');
            this.router.navigate(['/bienes', bien.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error creando el bien', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.bienId) {
      this.router.navigate(['/bienes', this.bienId]);
    } else {
      this.router.navigate(['/bienes']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
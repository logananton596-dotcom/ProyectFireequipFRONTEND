import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { UbicacionService } from '../../../../core/services/ubicacion.service';
import { AreaService } from '../../../../core/services/area.service';
import {
  Ubicacion,
  TipoUbicacion,
  TIPOS_UBICACION,
  formatearTipoUbicacion
} from '../../../../core/models/ubicacion.model';
import { Area } from '../../../../core/models/area.model';

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
  private areaService = inject(AreaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  ubicacionId: number | null = null;
  loading = signal(false);
  submitting = signal(false);

  private subscriptions: Subscription = new Subscription();

  // Catálogos
  tiposUbicacion = TIPOS_UBICACION;
  areas: Area[] = [];
  padresDisponibles: Ubicacion[] = [];

  // Helpers
  formatearTipoUbicacion = formatearTipoUbicacion;

  // Formulario
  ubicacionForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(50)]],
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    tipo: ['', [Validators.required]],
    tipoPersonalizado: [''],
    padreId: [null],
    areaId: [null],
    activa: [true],
    observacion: ['', Validators.maxLength(300)]
  });

  ngOnInit(): void {
    this.cargarAreas();
    this.configurarLogicaTipo();
    this.configurarLogicaPadre();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.ubicacionId = Number(params['id']);
        this.loadUbicacion();
      } else {
        // Si es nuevo, cargar padres disponibles de inmediato
        this.cargarPadresDisponibles('', '');
      }
    });
  }

  // ============ CARGA DE CATÁLOGOS ============

  private cargarAreas(): void {
    this.subscriptions.add(
      this.areaService.getAll().subscribe({
        next: (areas) => {
          this.areas = areas.filter(a => a.activo === true);
        },
        error: () => {
          this.toastr.warning('No se pudieron cargar las áreas', 'Advertencia');
        }
      })
    );
  }

  private cargarPadresDisponibles(tipoHijo: TipoUbicacion | '', excluirId: number | ''): void {
    // Si no hay tipo seleccionado, no mostrar padres
    if (!tipoHijo) {
      this.padresDisponibles = [];
      return;
    }

    // Un PISO no puede tener padre
    if (tipoHijo === 'PISO') {
      this.padresDisponibles = [];
      return;
    }

    // Determinar qué tipos de padre son válidos según el tipo hijo
    const tiposPadreValidos = this.tiposPadrePermitidos(tipoHijo);
    if (tiposPadreValidos.length === 0) {
      this.padresDisponibles = [];
      return;
    }

    this.subscriptions.add(
      this.ubicacionService.getActivas().subscribe({
        next: (ubicaciones) => {
          this.padresDisponibles = ubicaciones.filter(u => {
            // Excluir la ubicación actual (no puede ser su propio padre)
            if (excluirId && u.id === Number(excluirId)) return false;
            // Solo tipos válidos
            return tiposPadreValidos.includes(u.tipo);
          });
        },
        error: () => {
          this.toastr.warning('No se pudieron cargar las ubicaciones padre', 'Advertencia');
        }
      })
    );
  }

  private tiposPadrePermitidos(tipoHijo: TipoUbicacion): TipoUbicacion[] {
    switch (tipoHijo) {
      case 'OFICINA':
        return ['PISO'];
      case 'CASILLERO':
        return ['OFICINA', 'PISO', 'PASILLO'];
      case 'COMPARTIMIENTO':
        return ['VEHICULO'];
      case 'VEHICULO':
        return ['GARAJE', 'PATIO', 'PISO'];
      case 'PASILLO':
        return ['PISO'];
      case 'DEPOSITO':
        return ['PISO', 'OFICINA'];
      case 'PATIO':
      case 'GARAJE':
        return ['PISO'];
      default:
        return [];
    }
  }

  // ============ LÓGICA DE CAMBIOS ============

  private configurarLogicaTipo(): void {
    this.ubicacionForm.get('tipo')?.valueChanges.subscribe((tipo: TipoUbicacion | '') => {
      // Si cambia el tipo, recargar padres y limpiar selección
      this.ubicacionForm.patchValue({ padreId: null }, { emitEvent: false });
      this.cargarPadresDisponibles(tipo, this.ubicacionId ?? '');

      // Limpiar tipoPersonalizado si no es OTRO
      if (tipo !== 'OTRO') {
        this.ubicacionForm.patchValue({ tipoPersonalizado: '' }, { emitEvent: false });
      }

      // Validación dinámica de tipoPersonalizado
      const tipoPersonalizadoControl = this.ubicacionForm.get('tipoPersonalizado');
      if (tipo === 'OTRO') {
        tipoPersonalizadoControl?.setValidators([Validators.required, Validators.maxLength(50)]);
      } else {
        tipoPersonalizadoControl?.clearValidators();
      }
      tipoPersonalizadoControl?.updateValueAndValidity();
    });
  }

  private configurarLogicaPadre(): void {
    this.ubicacionForm.get('padreId')?.valueChanges.subscribe((padreId: number | null) => {
      // Al cambiar el padre, si el padre tiene área, sugerir el área del padre
      if (padreId == null) return;
      const padre = this.padresDisponibles.find(p => p.id === padreId);
      if (padre && padre.areaId != null && this.ubicacionForm.get('areaId')?.value == null) {
        this.ubicacionForm.patchValue({ areaId: padre.areaId }, { emitEvent: false });
      }
    });
  }

  // ============ CARGA DE UBICACIÓN EN EDICIÓN ============

  loadUbicacion(): void {
    if (!this.ubicacionId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.ubicacionService.getById(this.ubicacionId).subscribe({
        next: (ubicacion) => {
          this.ubicacionForm.patchValue({
            codigo: ubicacion.codigo,
            nombre: ubicacion.nombre,
            tipo: ubicacion.tipo,
            tipoPersonalizado: ubicacion.tipoPersonalizado || '',
            padreId: ubicacion.padreId ?? null,
            areaId: ubicacion.areaId ?? null,
            activa: ubicacion.activa,
            observacion: ubicacion.observacion || ''
          });

          // Cargar padres después de setear el tipo
          this.cargarPadresDisponibles(ubicacion.tipo, ubicacion.id ?? '');

          // Reaplicar validación de tipoPersonalizado
          const tipoPersonalizadoControl = this.ubicacionForm.get('tipoPersonalizado');
          if (ubicacion.tipo === 'OTRO') {
            tipoPersonalizadoControl?.setValidators([Validators.required, Validators.maxLength(50)]);
          } else {
            tipoPersonalizadoControl?.clearValidators();
          }
          tipoPersonalizadoControl?.updateValueAndValidity();

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

  // ============ SUBMIT ============

  onSubmit(): void {
    if (this.ubicacionForm.invalid) {
      this.ubicacionForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.ubicacionForm.value;

    // Limpiar campos irrelevantes según el tipo
    if (formValue.tipo !== 'OTRO') {
      formValue.tipoPersonalizado = null;
    }
    if (formValue.tipo === 'PISO') {
      formValue.padreId = null;
    }

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
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EquipoService } from '../../../../core/services/equipo.service';
import { AreaService } from '../../../../core/services/area.service';
import {
  NOMBRES_EQUIPO, TIPOS_EQUIPO, TIPOS_INVENTARIO, ESTADOS_EQUIPO,
  formatearNombreEquipo, formatearTipoEquipo, formatearTipoInventario, formatearEstadoEquipo
} from '../../../../core/models/equipo.model';
import { COMPANIAS_BOMBERO, formatearCompania } from '../../../../core/models/bombero.model';
import { NOMBRES_AREA, formatearNombreArea } from '../../../../core/models/area.model';
import { Area } from '../../../../core/models/area.model';
import { Subscription } from 'rxjs';
import { SelectUbicacionComponent } from '../../../../shared/components/select-ubicacion/select-ubicacion.component';

@Component({
  selector: 'app-equipo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,SelectUbicacionComponent],
  templateUrl: './equipo-form.html',
  styleUrls: ['./equipo-form.css']
})
export class EquiposForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private equipoService = inject(EquipoService);
  private areaService = inject(AreaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  equipoId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  mostrarCamposBaja = signal(false);

  private subscriptions: Subscription = new Subscription();

  // Enums y helpers
  nombresEquipo = NOMBRES_EQUIPO;
  tiposEquipo = TIPOS_EQUIPO;
  tiposInventario = TIPOS_INVENTARIO;
  estadosEquipo = ESTADOS_EQUIPO;
  companias = COMPANIAS_BOMBERO;
  nombresArea = NOMBRES_AREA;

  formatearNombreEquipo = formatearNombreEquipo;
  formatearTipoEquipo = formatearTipoEquipo;
  formatearTipoInventario = formatearTipoInventario;
  formatearEstadoEquipo = formatearEstadoEquipo;
  formatearCompania = formatearCompania;
  formatearNombreArea = formatearNombreArea;

  areasActivas: Area[] = [];

  // Formulario
  equipoForm: FormGroup = this.fb.group({
    codigoCgbvp: [''],
    numeroSerie: [''],
    nombreEquipo: ['', Validators.required],
    tipoEquipo: ['', Validators.required],
    tipoInventario: ['INDIVIDUAL', Validators.required],
    compania: ['', Validators.required],
    estado: ['OPERATIVO', Validators.required],
    fechaIncorporacion: ['', Validators.required],
    vidaUtilAnios: ['', [Validators.required, Validators.min(1)]],
    fechaBaja: [''],
    motivoBaja: [''],
    stock: [1, [Validators.required, Validators.min(1)]],
    stockMinimo: [1, [Validators.required, Validators.min(0)]], 
    especificacion: [''],
    material: [''],
    marca: [''],
    modelo: [''],
    color: [''],
    observaciones: [''],
    nombreArea: ['', Validators.required],
    asignado: [false],
    ubicacionId: [null]
  }, {
    validators: [
      this.validarCamposBaja.bind(this),
      this.validarCamposIndividual.bind(this)
    ]
  });

  ngOnInit(): void {
    this.cargarAreas();
    this.configurarLogicaInventario();

    // Escuchar cambios en estado
    this.equipoForm.get('estado')?.valueChanges.subscribe((estado: string) => {
      this.mostrarCamposBaja.set(estado === 'BAJA');
      if (estado !== 'BAJA') {
        this.equipoForm.patchValue({ fechaBaja: null, motivoBaja: null });
      }
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.equipoId = Number(params['id']);
        this.loadEquipo();
      } else {
        // Valores por defecto para nuevo equipo
        this.equipoForm.patchValue({
          tipoInventario: 'INDIVIDUAL',
          stock: 1,
          stockMinimo: 1
        });
        this.actualizarCamposPorInventario('INDIVIDUAL');
      }
    });
  }

  private cargarAreas(): void {
    this.subscriptions.add(
      this.areaService.getAll().subscribe({
        next: (areas) => {
          this.areasActivas = areas.filter(a => a.activo === true);
        },
        error: () => {
          this.toastr.error('Error cargando áreas', 'Error');
        }
      })
    );
  }

  // Configura lógica según tipo de inventario
  private configurarLogicaInventario(): void {
    this.equipoForm.get('tipoInventario')?.valueChanges.subscribe((tipo: string) => {
      this.actualizarCamposPorInventario(tipo);
    });
  }

  private actualizarCamposPorInventario(tipo: string): void {
    const esIndividual = tipo === 'INDIVIDUAL';

    const codigoControl = this.equipoForm.get('codigoCgbvp');
    const serieControl = this.equipoForm.get('numeroSerie');
    const stockControl = this.equipoForm.get('stock');
    const stockMinimoControl = this.equipoForm.get('stockMinimo');

    if (esIndividual) {
      // 1. Habilitar y hacer requeridos los campos de equipo individual
      codigoControl?.enable({ emitEvent: false });
      serieControl?.enable({ emitEvent: false });
      codigoControl?.setValidators([Validators.required]);
      serieControl?.setValidators([Validators.required]);

      // 2. Limpiar validadores ANTES de deshabilitar los campos de stock
      stockControl?.clearValidators();
      stockMinimoControl?.clearValidators();
      
      // 3. Deshabilitar controles para que el usuario no los edite en la pantalla
      stockControl?.disable({ emitEvent: false });
      stockMinimoControl?.disable({ emitEvent: false });

      // 4. Asignar los valores obligatorios por defecto que exige tu Backend
      this.equipoForm.patchValue({
        stock: 1,
        stockMinimo: 1
      }, { emitEvent: false });

    } else {
      // 1. Deshabilitar campos individuales para que NO viajen al backend en modo MULTIPLE
      codigoControl?.disable({ emitEvent: false });
      serieControl?.disable({ emitEvent: false });
      codigoControl?.clearValidators();
      serieControl?.clearValidators();

      // 2. Limpiar sus valores pasándolos a null de forma limpia
      this.equipoForm.patchValue({
        codigoCgbvp: null,
        numeroSerie: null
      }, { emitEvent: false });

      // 3. Habilitar controles de stock para el modo colectivo
      stockControl?.enable({ emitEvent: false });
      stockMinimoControl?.enable({ emitEvent: false });
      
      stockControl?.setValidators([Validators.required, Validators.min(1)]);
      stockMinimoControl?.setValidators([Validators.required, Validators.min(0)]);

      // 4. Establecer un valor inicial sugerido para múltiple
 if (!this.isEditMode()) {
        this.equipoForm.patchValue({
          stock: 1,
          stockMinimo: 1
        }, { emitEvent: false });
      }
    }

    // Forzar actualización sincronizada de todos los estados de validación
    codigoControl?.updateValueAndValidity({ emitEvent: false });
    serieControl?.updateValueAndValidity({ emitEvent: false });
    stockControl?.updateValueAndValidity({ emitEvent: false });
    stockMinimoControl?.updateValueAndValidity({ emitEvent: false });
  }


  // Validador: campos de baja obligatorios si estado = BAJA
  private validarCamposBaja(group: FormGroup): ValidationErrors | null {
    const estado = group.get('estado')?.value;
    const fechaBaja = group.get('fechaBaja')?.value;
    const motivoBaja = group.get('motivoBaja')?.value;

    if (estado === 'BAJA') {
      if (!fechaBaja) return { fechaBajaRequerida: true };
      if (!motivoBaja || !motivoBaja.trim()) return { motivoBajaRequerido: true };
    }
    return null;
  }

  // Validador: si INDIVIDUAL, código y serie obligatorios
  private validarCamposIndividual(group: FormGroup): ValidationErrors | null {
    const tipoInventario = group.get('tipoInventario')?.value;
    const codigo = group.get('codigoCgbvp')?.value;
    const serie = group.get('numeroSerie')?.value;

    if (tipoInventario === 'INDIVIDUAL') {
      if (!codigo) return { codigoRequerido: true };
      if (!serie) return { serieRequerida: true };
    }
    return null;
  }

  loadEquipo(): void {
    if (!this.equipoId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.equipoService.getById(this.equipoId).subscribe({
        next: (equipo) => {
          this.equipoForm.patchValue({
            codigoCgbvp: equipo.codigoCgbvp || '',
            numeroSerie: equipo.numeroSerie || '',
            nombreEquipo: equipo.nombreEquipo,
            tipoEquipo: equipo.tipoEquipo,
            tipoInventario: equipo.tipoInventario,
            compania: equipo.compania,
            estado: equipo.estado,
            fechaIncorporacion: this.formatDateForInput(equipo.fechaIncorporacion),
            vidaUtilAnios: equipo.vidaUtilAnios,
            fechaBaja: equipo.fechaBaja ? this.formatDateForInput(equipo.fechaBaja) : '',
            motivoBaja: equipo.motivoBaja || '',
            stock: equipo.stock,
            stockMinimo: equipo.stockMinimo,
            especificacion: equipo.especificacion || '',
            material: equipo.material || '',
            marca: equipo.marca || '',
            modelo: equipo.modelo || '',
            color: equipo.color || '',
            observaciones: equipo.observaciones || '',
            nombreArea: equipo.nombreArea,
            asignado: equipo.asignado
          });

          this.mostrarCamposBaja.set(equipo.estado === 'BAJA');
          this.actualizarCamposPorInventario(equipo.tipoInventario);
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el equipo', 'Error');
          this.loading.set(false);
          this.router.navigate(['/equipos']);
        }
      })
    );
  }

  private formatDateForInput(date: Date | null | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.equipoForm.invalid) {
      this.equipoForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos correctamente', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.equipoForm.getRawValue();

    if (formValue.tipoInventario === 'INDIVIDUAL') {
      formValue.stock = 1;
      formValue.stockMinimo = 1; // Satisface al 100% el @NotNull del backend
    } else {
      formValue.stock = Number(formValue.stock);
      formValue.stockMinimo = Number(formValue.stockMinimo);
    }

    if (this.isEditMode() && this.equipoId) {
      this.subscriptions.add(
        this.equipoService.update(this.equipoId, formValue).subscribe({
          next: () => {
            this.toastr.success('Equipo actualizado correctamente', 'Éxito');
            this.router.navigate(['/equipos', this.equipoId]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error actualizando el equipo', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.equipoService.create(formValue).subscribe({
          next: (equipo) => {
            this.toastr.success('Equipo creado correctamente', 'Éxito');
            this.router.navigate(['/equipos', equipo.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error creando el equipo', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.equipoId) {
      this.router.navigate(['/equipos', this.equipoId]);
    } else {
      this.router.navigate(['/equipos']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
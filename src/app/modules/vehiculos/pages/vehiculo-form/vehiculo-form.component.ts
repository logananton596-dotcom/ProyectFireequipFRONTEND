import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { VehiculoService } from '../../../../core/services/vehiculo.service';
import {
  TIPOS_VEHICULO,
  ESTADOS_VEHICULO,
  TIPOS_COMBUSTIBLE,
  TIPOS_LLANTA,
  TipoVehiculo,
  formatearTipoVehiculo,
  formatearEstadoVehiculo,
  formatearTipoCombustible,
  formatearTipoLlanta,
  esVehiculoContraIncendio
} from '../../../../core/models/vehiculo.model';
import { SelectUbicacionComponent } from '../../../../shared/components/select-ubicacion/select-ubicacion.component';

@Component({
  selector: 'app-vehiculo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectUbicacionComponent],
  templateUrl: './vehiculo-form.component.html',
  styleUrls: ['./vehiculo-form.component.css']
})
export class VehiculoFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private vehiculoService = inject(VehiculoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  vehiculoId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  esContraIncendio = signal(false);

  private subscriptions: Subscription = new Subscription();

  // Enums
  tiposVehiculo = TIPOS_VEHICULO;
  estadosVehiculo = ESTADOS_VEHICULO;
  tiposCombustible = TIPOS_COMBUSTIBLE;
  tiposLlanta = TIPOS_LLANTA;

  // Helpers
  formatearTipoVehiculo = formatearTipoVehiculo;
  formatearEstadoVehiculo = formatearEstadoVehiculo;
  formatearTipoCombustible = formatearTipoCombustible;
  formatearTipoLlanta = formatearTipoLlanta;

  // Formulario
  vehiculoForm: FormGroup = this.fb.group({
    // Identificación
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombreVehiculo: ['', [Validators.required, Validators.maxLength(80)]],
    placa: ['', [Validators.maxLength(15)]],
    marca: ['', [Validators.required, Validators.maxLength(80)]],
    modelo: ['', [Validators.maxLength(80)]],
    anio: [null, [Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    tipoVehiculo: ['', [Validators.required]],
    estado: ['OPERATIVO', [Validators.required]],
    numeroMotor: ['', [Validators.maxLength(30)]],
    numeroChasis: ['', [Validators.maxLength(30)]],
    observacion: ['', [Validators.maxLength(500)]],

    // Capacidades
    capacidadAguaLitros: [null, [Validators.min(0)]],
    capacidadCombustibleGalones: [null, [Validators.min(0)]],

    // Combustible y aceite
    tipoCombustible: [null],
    tipoAceite: ['', [Validators.maxLength(50)]],
    intervaloCambioAceiteKm: [null, [Validators.min(0)]],

    // Llantas
    marcaLlanta: ['', [Validators.maxLength(50)]],
    medidaLlanta: ['', [Validators.maxLength(50)]],
    tamanoAro: ['', [Validators.maxLength(20)]],
    tipoLlanta: [null],
    presionLlanta: ['', [Validators.maxLength(20)]],

    // Batería
    tipoBateria: ['', [Validators.maxLength(50)]],
    marcaBateria: ['', [Validators.maxLength(50)]],
    amperajeBateria: ['', [Validators.maxLength(30)]],
    numeroPlacasBateria: [null, [Validators.min(0)]],

    // Documentación legal
    soatVigencia: [null],
    revisionTecnicaVigencia: [null],

    // Servicio
    tiempoServicioAnios: [null, [Validators.min(0)]],
    fechaIncorporacion: [null],

    // Ubicación
    ubicacionNodoId: [null, [Validators.required]],

    // Activo
    activo: [true]
  });

  ngOnInit(): void {
    // Escuchar cambios de tipo para activar/desactivar capacidad de agua
    this.vehiculoForm.get('tipoVehiculo')?.valueChanges.subscribe((tipo: TipoVehiculo) => {
      this.actualizarReglasTipo(tipo);
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.vehiculoId = Number(params['id']);
        this.loadVehiculo();
      }
    });
  }

  private actualizarReglasTipo(tipo: TipoVehiculo): void {
    const esCI = esVehiculoContraIncendio(tipo);
    this.esContraIncendio.set(esCI);

    const capacidadControl = this.vehiculoForm.get('capacidadAguaLitros');

    if (esCI) {
      capacidadControl?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      capacidadControl?.clearValidators();
      capacidadControl?.setValue(null, { emitEvent: false });
    }
    capacidadControl?.updateValueAndValidity();
  }

  loadVehiculo(): void {
    if (!this.vehiculoId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.vehiculoService.getById(this.vehiculoId).subscribe({
        next: (v) => {
          this.vehiculoForm.patchValue({
            codigo: v.codigo,
            nombreVehiculo: v.nombreVehiculo,
            placa: v.placa || '',
            marca: v.marca,
            modelo: v.modelo || '',
            anio: v.anio ?? null,
            tipoVehiculo: v.tipoVehiculo,
            estado: v.estado,
            numeroMotor: v.numeroMotor || '',
            numeroChasis: v.numeroChasis || '',
            observacion: v.observacion || '',

            capacidadAguaLitros: v.capacidadAguaLitros ?? null,
            capacidadCombustibleGalones: v.capacidadCombustibleGalones ?? null,

            tipoCombustible: v.tipoCombustible ?? null,
            tipoAceite: v.tipoAceite || '',
            intervaloCambioAceiteKm: v.intervaloCambioAceiteKm ?? null,

            marcaLlanta: v.marcaLlanta || '',
            medidaLlanta: v.medidaLlanta || '',
            tamanoAro: v.tamanoAro || '',
            tipoLlanta: v.tipoLlanta ?? null,
            presionLlanta: v.presionLlanta || '',

            tipoBateria: v.tipoBateria || '',
            marcaBateria: v.marcaBateria || '',
            amperajeBateria: v.amperajeBateria || '',
            numeroPlacasBateria: v.numeroPlacasBateria ?? null,

            soatVigencia: this.formatDateForInput(v.soatVigencia),
            revisionTecnicaVigencia: this.formatDateForInput(v.revisionTecnicaVigencia),

            tiempoServicioAnios: v.tiempoServicioAnios ?? null,
            fechaIncorporacion: this.formatDateForInput(v.fechaIncorporacion),

            ubicacionNodoId: v.ubicacionNodoId ?? null,
            activo: v.activo
          });

          this.esContraIncendio.set(esVehiculoContraIncendio(v.tipoVehiculo));

          // Re-aplicar validadores de capacidad de agua
          const capacidadControl = this.vehiculoForm.get('capacidadAguaLitros');
          if (this.esContraIncendio()) {
            capacidadControl?.setValidators([Validators.required, Validators.min(1)]);
          } else {
            capacidadControl?.clearValidators();
          }
          capacidadControl?.updateValueAndValidity();

          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el vehículo', 'Error');
          this.loading.set(false);
          this.router.navigate(['/vehiculos']);
        }
      })
    );
  }

  private formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.vehiculoForm.invalid) {
      this.vehiculoForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.vehiculoForm.getRawValue();

    // Limpiar capacidad de agua si no es contra incendio
    if (!this.esContraIncendio()) {
      formValue.capacidadAguaLitros = null;
    }

    // Convertir campos numéricos vacíos a null
    if (formValue.anio === '') formValue.anio = null;
    if (formValue.capacidadAguaLitros === '') formValue.capacidadAguaLitros = null;
    if (formValue.capacidadCombustibleGalones === '') formValue.capacidadCombustibleGalones = null;
    if (formValue.intervaloCambioAceiteKm === '') formValue.intervaloCambioAceiteKm = null;
    if (formValue.numeroPlacasBateria === '') formValue.numeroPlacasBateria = null;
    if (formValue.tiempoServicioAnios === '') formValue.tiempoServicioAnios = null;

    if (this.isEditMode() && this.vehiculoId) {
      this.subscriptions.add(
        this.vehiculoService.update(this.vehiculoId, formValue).subscribe({
          next: () => {
            this.toastr.success('Vehículo actualizado correctamente', 'Éxito');
            this.router.navigate(['/vehiculos', this.vehiculoId]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error actualizando el vehículo', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.vehiculoService.create(formValue).subscribe({
          next: (v) => {
            this.toastr.success('Vehículo creado correctamente', 'Éxito');
            this.router.navigate(['/vehiculos', v.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error creando el vehículo', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.vehiculoId) {
      this.router.navigate(['/vehiculos', this.vehiculoId]);
    } else {
      this.router.navigate(['/vehiculos']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
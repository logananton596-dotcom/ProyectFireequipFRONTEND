import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import {
  NOMBRES_VEHICULO,
  MARCAS_VEHICULO,
  TIPOS_VEHICULO,
  ESTADOS_VEHICULO,
  NOMBRES_UBICACION,
  formatearNombreVehiculo,
  formatearMarcaVehiculo,
  formatearTipoVehiculo,
  formatearEstadoVehiculo
} from '../../../../core/models/vehiculo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehiculo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  private subscriptions: Subscription = new Subscription();

  // Enums
  nombresVehiculo = NOMBRES_VEHICULO;
  marcasVehiculo = MARCAS_VEHICULO;
  tiposVehiculo = TIPOS_VEHICULO;
  estadosVehiculo = ESTADOS_VEHICULO;
  nombresUbicacion = NOMBRES_UBICACION;

  // Helpers
  formatearNombreVehiculo = formatearNombreVehiculo;
  formatearMarcaVehiculo = formatearMarcaVehiculo;
  formatearTipoVehiculo = formatearTipoVehiculo;
  formatearEstadoVehiculo = formatearEstadoVehiculo;

  // Formulario
  vehiculoForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombreVehiculo: ['', Validators.required],
    placa: ['', [Validators.required, Validators.maxLength(15)]],
    marca: ['', Validators.required],
    tipoVehiculo: ['', Validators.required],
    estado: ['OPERATIVO', Validators.required],
    modelo: ['', Validators.maxLength(80)],
    anio: ['', [Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    capacidadAgua: ['', Validators.min(0)],
    capacidadEspuma: ['', Validators.min(0)],
    observacion: ['', Validators.maxLength(500)],
    activo: [true],
    nombreUbicacion: ['', Validators.required],
    numeroMotor: ['', Validators.maxLength(30)],
    numeroChasis: ['', Validators.maxLength(30)]
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.vehiculoId = Number(params['id']);
        this.loadVehiculo();
      }
    });
  }

  loadVehiculo(): void {
    if (!this.vehiculoId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.vehiculoService.getById(this.vehiculoId).subscribe({
        next: (vehiculo) => {
          this.vehiculoForm.patchValue({
            codigo: vehiculo.codigo,
            nombreVehiculo: vehiculo.nombreVehiculo,
            placa: vehiculo.placa,
            marca: vehiculo.marca,
            tipoVehiculo: vehiculo.tipoVehiculo,
            estado: vehiculo.estado,
            modelo: vehiculo.modelo || '',
            anio: vehiculo.anio || '',
            capacidadAgua: vehiculo.capacidadAgua || '',
            capacidadEspuma: vehiculo.capacidadEspuma || '',
            observacion: vehiculo.observacion || '',
            activo: vehiculo.activo,
            nombreUbicacion: vehiculo.nombreUbicacion,
            numeroMotor: vehiculo.numeroMotor || '',
            numeroChasis: vehiculo.numeroChasis || ''
          });
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

  onSubmit(): void {
    if (this.vehiculoForm.invalid) {
      this.vehiculoForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.vehiculoForm.value;

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
          next: (vehiculo) => {
            this.toastr.success('Vehículo creado correctamente', 'Éxito');
            this.router.navigate(['/vehiculos', vehiculo.id]);
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
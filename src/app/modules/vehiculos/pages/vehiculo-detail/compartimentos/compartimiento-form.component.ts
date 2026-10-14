import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompartimientoService } from '../../../../../core/services/compartimiento.service';
import { VehiculoService } from '../../../../../core/services/vehiculo.service';
import { Vehiculo } from '../../../../../core/models/vehiculo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-compartimiento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './compartimiento-form.component.html',
  styleUrls: ['./compartimiento-form.component.css']
})
export class CompartimientoFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private compartimientoService = inject(CompartimientoService);
  private vehiculoService = inject(VehiculoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  compartimientoId: number | null = null;
  vehiculoId: number | null = null;
  vehiculos: Vehiculo[] = [];
  loading = signal(false);
  submitting = signal(false);

  private subscriptions: Subscription = new Subscription();

  // Formulario
  compartimientoForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(200)],
    capacidad: ['', [Validators.min(0)]],
    vehiculoId: ['', Validators.required],
    activo: [true],
    observaciones: ['', Validators.maxLength(500)]
  });

  ngOnInit(): void {
    this.cargarVehiculos();

    this.route.params.subscribe(params => {
      this.vehiculoId = Number(params['vehiculoId']);

      if (params['id']) {
        this.isEditMode.set(true);
        this.compartimientoId = Number(params['id']);
        this.loadCompartimiento();
      } else {
        // Preseleccionar el vehículo actual
        if (this.vehiculoId) {
          this.compartimientoForm.patchValue({ vehiculoId: this.vehiculoId });
        }
      }
    });
  }

  private cargarVehiculos(): void {
    this.subscriptions.add(
      this.vehiculoService.getActivos().subscribe({
        next: (data) => {
          this.vehiculos = data;
        },
        error: () => {
          this.toastr.error('Error cargando vehículos', 'Error');
        }
      })
    );
  }

  loadCompartimiento(): void {
    if (!this.compartimientoId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.compartimientoService.getById(this.compartimientoId).subscribe({
        next: (compartimiento) => {
          this.compartimientoForm.patchValue({
            codigo: compartimiento.codigo,
            nombre: compartimiento.nombre,
            descripcion: compartimiento.descripcion || '',
            capacidad: compartimiento.capacidad || '',
            vehiculoId: compartimiento.vehiculoId,
            activo: compartimiento.activo,
            observaciones: compartimiento.observaciones || ''
          });
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el compartimiento', 'Error');
          this.loading.set(false);
          this.router.navigate(['/vehiculos', this.vehiculoId, 'compartimientos']);
        }
      })
    );
  }

  onSubmit(): void {
    if (this.compartimientoForm.invalid) {
      this.compartimientoForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.compartimientoForm.value;

    if (this.isEditMode() && this.compartimientoId) {
      this.subscriptions.add(
        this.compartimientoService.update(this.compartimientoId, formValue).subscribe({
          next: () => {
            this.toastr.success('Compartimiento actualizado correctamente', 'Éxito');
            this.router.navigate(['/vehiculos', this.vehiculoId, 'compartimientos', this.compartimientoId]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error actualizando el compartimiento', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.compartimientoService.create(formValue).subscribe({
          next: (compartimiento) => {
            this.toastr.success('Compartimiento creado correctamente', 'Éxito');
            this.router.navigate(['/vehiculos', this.vehiculoId, 'compartimientos', compartimiento.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error creando el compartimiento', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.compartimientoId) {
      this.router.navigate(['/vehiculos', this.vehiculoId, 'compartimientos', this.compartimientoId]);
    } else {
      this.router.navigate(['/vehiculos', this.vehiculoId, 'compartimientos']);
    }
  }

  getVehiculoDisplay(vehiculo: Vehiculo): string {
    return `${vehiculo.codigo} - ${vehiculo.nombreVehiculo}`;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AsignacionService } from '../../../../core/services/asignacion.service';
import { EquipoService } from '../../../../core/services/equipo.service';
import { EppService } from '../../../../core/services/epp.service';
import { BienService } from '../../../../core/services/bien.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { VehiculoService } from '../../../../core/services/vehiculo.service';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import { CompartimientoService } from '../../../../core/services/compartimiento.service';
import {
  TIPOS_RECURSO,
  TIPOS_DESTINO,
  CrearAsignacionRequest,
  TipoRecurso,
  TipoDestino
} from '../../../../core/models/asignacion.model';
import { Equipo } from '../../../../core/models/equipo.model';
import { Epp } from '../../../../core/models/epp.model';
import { Bien } from '../../../../core/models/bien.model';
import { Bombero } from '../../../../core/models/bombero.model';
import { Vehiculo } from '../../../../core/models/vehiculo.model';
import { Ubicacion } from '../../../../core/models/ubicacion.model';
import { Compartimiento } from '../../../../core/models/compartimiento.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asignacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asignacion-form.component.html',
  styleUrls: ['./asignacion-form.component.css']
})
export class AsignacionFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private asignacionService = inject(AsignacionService);
  private equipoService = inject(EquipoService);
  private eppService = inject(EppService);
  private bienService = inject(BienService);
  private bomberoService = inject(BomberoService);
  private vehiculoService = inject(VehiculoService);
  private ubicacionService = inject(UbicacionService);
  private compartimientoService = inject(CompartimientoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  asignacionId: number | null = null;
  loading = signal(false);
  submitting = signal(false);

  private subscriptions: Subscription = new Subscription();

  // Enums
  tiposRecurso = TIPOS_RECURSO;
  tiposDestino = TIPOS_DESTINO;

  // Listas para selectores
  equiposDisponibles: Equipo[] = [];
  eppsDisponibles: Epp[] = [];
  bienesDisponibles: Bien[] = [];
  bomberosActivos: Bombero[] = [];
  vehiculosActivos: Vehiculo[] = [];
  ubicacionesActivas: Ubicacion[] = [];
  compartimientos: Compartimiento[] = [];

  // Control de visibilidad
  tipoRecursoSeleccionado = signal<TipoRecurso>('EQUIPO');
  tipoDestinoSeleccionado = signal<TipoDestino>('BOMBERO');
  vehiculoSeleccionado = signal<number | null>(null);

  // Formulario
  asignacionForm: FormGroup = this.fb.group({
    tipoRecurso: ['EQUIPO', Validators.required],
    equipoId: [null],
    eppId: [null],
    bienId: [null],
    tipoDestino: ['BOMBERO', Validators.required],
    bomberoId: [null],
    vehiculoId: [null],
    ubicacionId: [null],
    compartimientoId: [null],
    fechaAsignacion: ['', Validators.required],
    fechaFin: [''],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.cargarCatalogos();

    // Escuchar cambios en tipo de recurso
    this.asignacionForm.get('tipoRecurso')?.valueChanges.subscribe((tipo: TipoRecurso) => {
      this.tipoRecursoSeleccionado.set(tipo);
      this.limpiarRecursoSeleccionado();
    });

    // Escuchar cambios en tipo de destino
    this.asignacionForm.get('tipoDestino')?.valueChanges.subscribe((tipo: TipoDestino) => {
      this.tipoDestinoSeleccionado.set(tipo);
      this.limpiarDestinoSeleccionado();
    });

    // Escuchar cambios en vehículo para cargar compartimientos
    this.asignacionForm.get('vehiculoId')?.valueChanges.subscribe((vehiculoId: number) => {
      this.vehiculoSeleccionado.set(vehiculoId);
      if (vehiculoId) {
        this.cargarCompartimientos(vehiculoId);
      } else {
        this.compartimientos = [];
        this.asignacionForm.patchValue({ compartimientoId: null });
      }
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.asignacionId = Number(params['id']);
        this.loadAsignacion();
      }
    });
  }

  private cargarCatalogos(): void {
    // Equipos disponibles
    this.subscriptions.add(
      this.equipoService.getDisponibles().subscribe({
        next: (data) => this.equiposDisponibles = data,
        error: () => this.toastr.error('Error cargando equipos', 'Error')
      })
    );

    // EPP disponibles
    this.subscriptions.add(
      this.eppService.getDisponibles().subscribe({
        next: (data) => this.eppsDisponibles = data,
        error: () => this.toastr.error('Error cargando EPP', 'Error')
      })
    );

    // Bienes disponibles
    this.subscriptions.add(
      this.bienService.getAll().subscribe({
        next: (data) => this.bienesDisponibles = data.filter(b => b.activo === true),
        error: () => this.toastr.error('Error cargando bienes', 'Error')
      })
    );

    // Bomberos activos
    this.subscriptions.add(
      this.bomberoService.getActivos().subscribe({
        next: (data) => this.bomberosActivos = data,
        error: () => this.toastr.error('Error cargando bomberos', 'Error')
      })
    );

    // Vehículos activos
    this.subscriptions.add(
      this.vehiculoService.getActivos().subscribe({
        next: (data) => this.vehiculosActivos = data,
        error: () => this.toastr.error('Error cargando vehículos', 'Error')
      })
    );

    // Ubicaciones activas
    this.subscriptions.add(
      this.ubicacionService.getActivas().subscribe({
        next: (data) => this.ubicacionesActivas = data,
        error: () => this.toastr.error('Error cargando ubicaciones', 'Error')
      })
    );
  }

  private cargarCompartimientos(vehiculoId: number): void {
    this.subscriptions.add(
      this.compartimientoService.getByVehiculo(vehiculoId).subscribe({
        next: (data) => {
          this.compartimientos = data.filter(c => c.activo === true);
        },
        error: () => {
          this.toastr.error('Error cargando compartimientos', 'Error');
          this.compartimientos = [];
        }
      })
    );
  }

  private limpiarRecursoSeleccionado(): void {
    this.asignacionForm.patchValue({
      equipoId: null,
      eppId: null,
      bienId: null
    });
  }

  private limpiarDestinoSeleccionado(): void {
    this.asignacionForm.patchValue({
      bomberoId: null,
      vehiculoId: null,
      ubicacionId: null,
      compartimientoId: null
    });
    this.compartimientos = [];
  }

  loadAsignacion(): void {
    if (!this.asignacionId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.asignacionService.getById(this.asignacionId).subscribe({
        next: (asignacion) => {
          const tipoRecurso = asignacion.equipoId ? 'EQUIPO' : asignacion.eppId ? 'EPP' : 'BIEN';

          this.asignacionForm.patchValue({
            tipoRecurso: tipoRecurso,
            equipoId: asignacion.equipoId || null,
            eppId: asignacion.eppId || null,
            bienId: asignacion.bienId || null,
            tipoDestino: asignacion.tipoDestino,
            bomberoId: asignacion.bomberoId || null,
            vehiculoId: asignacion.vehiculoId || null,
            ubicacionId: asignacion.ubicacionId || null,
            compartimientoId: asignacion.compartimientoId || null,
            fechaAsignacion: this.formatDateForInput(asignacion.fechaAsignacion),
            fechaFin: asignacion.fechaFin ? this.formatDateForInput(asignacion.fechaFin) : '',
            observaciones: asignacion.observaciones || ''
          });

          this.tipoRecursoSeleccionado.set(tipoRecurso as TipoRecurso);
          this.tipoDestinoSeleccionado.set(asignacion.tipoDestino);

          if (asignacion.vehiculoId) {
            this.vehiculoSeleccionado.set(asignacion.vehiculoId);
            this.cargarCompartimientos(asignacion.vehiculoId);
          }

          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando la asignación', 'Error');
          this.loading.set(false);
          this.router.navigate(['/asignaciones']);
        }
      })
    );
  }

  private formatDateForInput(date: string): string {
    if (!date) return '';
    return date;
  }

  // Helpers para mostrar en selects
  getEquipoDisplay(equipo: Equipo): string {
    return `${equipo.codigoCgbvp || equipo.numeroSerie} - ${equipo.nombreEquipo}`;
  }

  getEppDisplay(epp: Epp): string {
    return `${epp.codigoCgbvp || epp.numeroSerie} - ${epp.nombreEpp}`;
  }

  getBienDisplay(bien: Bien): string {
    return `${bien.codigoCgbvp} - ${bien.nombre}`;
  }

  getBomberoDisplay(bombero: Bombero): string {
    return `${bombero.codigoCgbvp} - ${bombero.grado} ${bombero.nombre} ${bombero.apellido}`;
  }

  getVehiculoDisplay(vehiculo: Vehiculo): string {
    return `${vehiculo.codigo} - ${vehiculo.nombreVehiculo}`;
  }

  getUbicacionDisplay(ubicacion: Ubicacion): string {
    return `${ubicacion.codigo} - ${ubicacion.nombre}`;
  }

  getCompartimientoDisplay(compartimiento: Compartimiento): string {
    return `${compartimiento.codigo} - ${compartimiento.nombre}`;
  }

  onSubmit(): void {
    if (this.asignacionForm.invalid) {
      this.asignacionForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.asignacionForm.value;

    // Validar que tenga exactamente un recurso
    const recursos = [formValue.equipoId, formValue.eppId, formValue.bienId].filter(id => id !== null && id !== undefined);
    if (recursos.length !== 1) {
      this.toastr.warning('Debe seleccionar exactamente un recurso', 'Validación');
      this.submitting.set(false);
      return;
    }

    // Validar que tenga exactamente un destino según tipo
    const destino = formValue.tipoDestino;
    if (destino === 'BOMBERO' && !formValue.bomberoId) {
      this.toastr.warning('Debe seleccionar un bombero', 'Validación');
      this.submitting.set(false);
      return;
    }
    if (destino === 'VEHICULO' && !formValue.vehiculoId) {
      this.toastr.warning('Debe seleccionar un vehículo', 'Validación');
      this.submitting.set(false);
      return;
    }
    if (destino === 'UBICACION' && !formValue.ubicacionId) {
      this.toastr.warning('Debe seleccionar una ubicación', 'Validación');
      this.submitting.set(false);
      return;
    }

    // Validar compartimiento solo cuando destino es VEHICULO
    if (formValue.compartimientoId && destino !== 'VEHICULO') {
      this.toastr.warning('El compartimiento solo aplica para vehículos', 'Validación');
      this.submitting.set(false);
      return;
    }

    // Validar fechas
    const fechaAsignacion = new Date(formValue.fechaAsignacion);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaAsignacion > hoy) {
      this.toastr.warning('La fecha de asignación no puede ser futura', 'Validación');
      this.submitting.set(false);
      return;
    }

    if (formValue.fechaFin) {
      const fechaFin = new Date(formValue.fechaFin);
      if (fechaFin <= fechaAsignacion) {
        this.toastr.warning('La fecha fin debe ser posterior a la fecha de asignación', 'Validación');
        this.submitting.set(false);
        return;
      }
    }

    // Construir payload
    const payload: CrearAsignacionRequest = {
      equipoId: formValue.equipoId || null,
      eppId: formValue.eppId || null,
      bienId: formValue.bienId || null,
      tipoDestino: formValue.tipoDestino,
      bomberoId: formValue.bomberoId || null,
      vehiculoId: formValue.vehiculoId || null,
      ubicacionId: formValue.ubicacionId || null,
      compartimientoId: formValue.compartimientoId || null,
      fechaAsignacion: formValue.fechaAsignacion,
      fechaFin: formValue.fechaFin || null,
      observaciones: formValue.observaciones || null
    };

    if (this.isEditMode() && this.asignacionId) {
      this.subscriptions.add(
        this.asignacionService.update(this.asignacionId, payload).subscribe({
          next: () => {
            this.toastr.success('Asignación actualizada correctamente', 'Éxito');
            this.router.navigate(['/asignaciones', this.asignacionId]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error actualizando la asignación', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.asignacionService.create(payload).subscribe({
          next: (asignacion) => {
            this.toastr.success('Asignación creada correctamente', 'Éxito');
            this.router.navigate(['/asignaciones', asignacion.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error creando la asignación', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.asignacionId) {
      this.router.navigate(['/asignaciones', this.asignacionId]);
    } else {
      this.router.navigate(['/asignaciones']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
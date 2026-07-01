import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, forkJoin } from 'rxjs'; // 💡 Importado forkJoin para cargar catálogos en paralelo de forma óptima
import { AsignacionEquipoService } from '../../../../core/services/asignacion-equipo.service';
import { EquipoService } from '../../../../core/services/equipo.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Equipo } from '../../../../core/models/equipo.model';
import { Bombero } from '../../../../core/models/bombero.model';

@Component({
  selector: 'app-asignacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asignacion-form.html',
  styleUrls: ['./asignacion-form.css']
})
export class AsignacionForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private asignacionService = inject(AsignacionEquipoService);
  private equipoService = inject(EquipoService);
  private bomberoService = inject(BomberoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  asignacionForm: FormGroup;
  equipos = signal<Equipo[]>([]);
  bomberos = signal<Bombero[]>([]);
  isEditMode = signal(false);
  asignacionId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  private subscriptions: Subscription = new Subscription();

  // Listas estáticas institucionales para estandarizar el llenado del formulario de bomberos
  estadosFisicosSugeridos = ['OPERATIVO / NUEVO', 'USADO / BUEN ESTADO', 'CON DESGASTE OPERATIVO', 'REQUIERE INSPECCIÓN'];
  tiposMovimientoSugeridos = ['DOTACIÓN INDIVIDUAL (PERMANENTE)', 'ASIGNACIÓN TEMPORAL (GUARDIA)', 'MATERIAL DE RESPALDO (ESTACIÓN)'];

  constructor() {
    this.asignacionForm = this.fb.group({
      equipoId: [null, Validators.required],
      bomberoId: [null, Validators.required],
      tallaEquipo: [''],
      caracteristicasEspecificas: [''],
      fechaPuestaOperatividad: [''],
      fechaCaducidad: [''],
      estadoFisicoEntrega: ['', Validators.required],
      tipoMovimiento: ['', Validators.required],
      responsableNombre: ['', Validators.required],
      responsableCodigo: ['', Validators.required],
      responsableGrado: [''],
      responsableCargo: [''],
      responsableTelefono: ['']
    });
  }

  ngOnInit(): void {
    this.loadCatalogosYFormulario();
  }

  // 💡 MEJORA ARQUITECTÓNICA: Centralizamos las cargas usando forkJoin para evitar múltiples solicitudes desordenadas
  loadCatalogosYFormulario(): void {
    this.loading.set(true);
    this.cdr.detectChanges();

    this.subscriptions.add(
      forkJoin({
        equipos: this.equipoService.getAll(),
        bomberos: this.bomberoService.getAll()
      }).subscribe({
        next: (res) => {
          this.equipos.set(res.equipos);
          this.bomberos.set(res.bomberos);
          
          // Una vez que los catálogos están listos, verificamos si es modo edición
          this.evaluarModoEdicion();
        },
        error: () => {
          this.toastr.error('Error al sincronizar catálogos institucionales', 'Error');
          this.loading.set(false);
          this.cdr.detectChanges();
        }
      })
    );
  }

  private evaluarModoEdicion(): void {
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode.set(true);
          this.asignacionId = Number(params['id']);
          this.loadAsignacion();
        } else {
          // Si no hay ID, el formulario es nuevo y apagamos el loading de inmediato
          this.loading.set(false);
          this.cdr.detectChanges();
        }
      })
    );
  }

  loadAsignacion(): void {
    if (!this.asignacionId) return;
    
    this.subscriptions.add(
      this.asignacionService.getById(this.asignacionId).subscribe({
        next: (asignacion) => {
          this.asignacionForm.patchValue({
            equipoId: asignacion.equipoId,
            bomberoId: asignacion.bomberoId,
            tallaEquipo: asignacion.tallaEquipo || '',
            caracteristicasEspecificas: asignacion.caracteristicasEspecificas || '',
            fechaPuestaOperatividad: asignacion.fechaPuestaOperatividad || '',
            fechaCaducidad: asignacion.fechaCaducidad || '',
            estadoFisicoEntrega: asignacion.estadoFisicoEntrega,
            tipoMovimiento: asignacion.tipoMovimiento,
            responsableNombre: asignacion.responsableNombre,
            responsableCodigo: asignacion.responsableCodigo,
            responsableGrado: asignacion.responsableGrado || '',
            responsableCargo: asignacion.responsableCargo || '',
            responsableTelefono: asignacion.responsableTelefono || ''
          });
          this.loading.set(false);
          this.cdr.detectChanges(); // 💡 Despierta visualmente la pantalla tras rellenar los inputs
        },
        error: () => {
          this.toastr.error('Error cargando los datos de la asignación', 'Error');
          this.loading.set(false);
          this.cdr.detectChanges();
          this.router.navigate(['/asignaciones']);
        }
      })
    );
  }

  onSubmit(): void {
    if (this.asignacionForm.invalid) {
      this.asignacionForm.markAllAsTouched();
      this.toastr.warning('Por favor complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    this.cdr.detectChanges();
    const formValue = this.asignacionForm.value;

    if (this.isEditMode() && this.asignacionId) {
      this.subscriptions.add(
        this.asignacionService.update(this.asignacionId, formValue).subscribe({
          next: () => {
            this.toastr.success('Asignación actualizada correctamente', 'Éxito');
            this.router.navigate(['/asignaciones']); // Redirige directo a la lista elástica
          },
          error: () => {
            this.toastr.error('Error actualizando la asignación', 'Error');
            this.submitting.set(false);
            this.cdr.detectChanges();
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.asignacionService.create(formValue).subscribe({
          next: () => {
            this.toastr.success('Asignación de equipo registrada con éxito', 'Éxito');
            this.router.navigate(['/asignaciones']); // Redirige directo a la lista elástica
          },
          error: () => {
            this.toastr.error('Error creando el registro de asignación', 'Error');
            this.submitting.set(false);
            this.cdr.detectChanges();
          }
        })
      );
    }
  }

  cancelar(): void {
    this.router.navigate(['/asignaciones']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

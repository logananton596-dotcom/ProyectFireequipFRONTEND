import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EppService } from '../../../../core/services/epp.service';
import { AreaService } from '../../../../core/services/area.service';
import { 
  TIPOS_EPP, NOMBRES_EPP, ESTADOS_EPP, 
  formatearTipoEpp, formatearNombreEpp, formatearEstadoEpp,
  EstadoEpp
} from '../../../../core/models/epp.model';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import { COMPANIAS_BOMBERO, formatearCompania } from '../../../../core/models/bombero.model';
import { Area } from '../../../../core/models/area.model';
import { Subscription } from 'rxjs';
import { SelectUbicacionComponent } from "../../../../shared/components/select-ubicacion/select-ubicacion.component";
import { Ubicacion } from '../../../../core/models/ubicacion.model';

@Component({
  selector: 'app-epp-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectUbicacionComponent],
  templateUrl: './epp-form.html',
  styleUrls: ['./epp-form.css']
})
export class EppForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private eppService = inject(EppService);
  private ubicacionService = inject(UbicacionService);
  private areaService = inject(AreaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  eppId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  mostrarCamposBaja = signal(false);

  areas = signal<Area[]>([]);
  ubicaciones = signal<Ubicacion[]>([]);
  private subscriptions: Subscription = new Subscription();

  // Enums y helpers
  tiposEpp = TIPOS_EPP;
  nombresEpp = NOMBRES_EPP;
  estadosEpp = ESTADOS_EPP;
  companias = COMPANIAS_BOMBERO;
  formatearTipoEpp = formatearTipoEpp;
  formatearNombreEpp = formatearNombreEpp;
  formatearEstadoEpp = formatearEstadoEpp;
  formatearCompania = formatearCompania;

  // Formulario
  eppForm: FormGroup = this.fb.group({
    codigoCgbvp: ['', [Validators.required]],
    numeroSerie: ['', [Validators.required]],
    tipoEpp: ['', [Validators.required]],
    nombreEpp: ['', [Validators.required]],
    compania: ['', [Validators.required]],
    areaId: [null, Validators.required],
    fechaIncorporacion: ['', [Validators.required]],
    vidaUtilAnios: ['', [Validators.required, Validators.min(1)]],
    estado: ['OPERATIVO', [Validators.required]],
    fechaBaja: [''],
    motivoBaja: [''],
    talla: [''],
    material: [''],
    marca: [''],
    color: [''],
    observaciones: [''],
    ubicacionId: [null]
  }, {
    validators: [
      this.validarCamposBaja.bind(this)
    ]
  });

  ngOnInit(): void {
    this.cargarAreas();
    this.cargarUbicaciones();
    // Escuchar cambios en estado para mostrar/ocultar campos de baja
    this.eppForm.get('estado')?.valueChanges.subscribe((estado: string) => {
      this.mostrarCamposBaja.set(estado === 'BAJA');
      if (estado !== 'BAJA') {
        this.eppForm.patchValue({
          fechaBaja: null,
          motivoBaja: null
        });
      }
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.eppId = Number(params['id']);
        this.loadEpp();
      }
    });
  }
  private cargarUbicaciones(): void {
    this.subscriptions.add(
      this.ubicacionService.getActivas().subscribe({
        next: (ubicaciones) => {
          this.ubicaciones.set(ubicaciones);
        },
        error: () => {
          this.toastr.error('Error cargando ubicaciones', 'Error');
        }
      })
    );
  }

  private cargarAreas(): void {
    this.subscriptions.add(
      this.areaService.getAll().subscribe({
        next: (data) => {
          // El filtrado es más seguro evaluando la verdad lógica del booleano (truthy)
          const activas = data.filter(a => a.activo);
          this.areas.set(activas); 
        },
        error: () => {
          this.toastr.error('Error cargando catálogo de áreas activas', 'Error');
        }
      })
    );
  }

  loadEpp(): void {
    if (!this.eppId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.eppService.getById(this.eppId).subscribe({
        next: (epp) => {
          this.eppForm.patchValue({
            codigoCgbvp: epp.codigoCgbvp,
            numeroSerie: epp.numeroSerie,
            tipoEpp: epp.tipoEpp,
            nombreEpp: epp.nombreEpp,
            compania: epp.compania,
            areaId: epp.areaId,
            fechaIncorporacion: this.formatDateForInput(epp.fechaIncorporacion),
            vidaUtilAnios: epp.vidaUtilAnios,
            estado: epp.estado,
            fechaBaja: epp.fechaBaja ? this.formatDateForInput(epp.fechaBaja) : null,
            motivoBaja: epp.motivoBaja || '',
            talla: epp.talla || '',
            material: epp.material || '',
            marca: epp.marca || '',
            color: epp.color || '',
            observaciones: epp.observaciones || ''
          });

          this.mostrarCamposBaja.set(epp.estado === 'BAJA');
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el EPP', 'Error');
          this.loading.set(false);
          this.router.navigate(['/epp']);
        }
      })
    );
  }

  private formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // Validador personalizado para campos de baja
  private validarCamposBaja(group: FormGroup): ValidationErrors | null {
    const estado = group.get('estado')?.value;
    const fechaBaja = group.get('fechaBaja')?.value;
    const motivoBaja = group.get('motivoBaja')?.value;

    if (estado === 'BAJA') {
      if (!fechaBaja) {
        return { fechaBajaRequerida: true };
      }
      if (!motivoBaja || !motivoBaja.trim()) {
        return { motivoBajaRequerido: true };
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.eppForm.invalid) {
      this.eppForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos correctamente', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.eppForm.value;

    if (this.isEditMode() && this.eppId) {
      this.subscriptions.add(
        this.eppService.update(this.eppId, formValue).subscribe({
          next: () => {
            this.toastr.success('EPP actualizado correctamente', 'Éxito');
            this.router.navigate(['/epp', this.eppId]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error actualizando el EPP', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.eppService.create(formValue).subscribe({
          next: (epp) => {
            this.toastr.success('EPP creado correctamente', 'Éxito');
            this.router.navigate(['/epp', epp.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error creando el EPP', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.eppId) {
      this.router.navigate(['/epp', this.eppId]);
    } else {
      this.router.navigate(['/epp']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
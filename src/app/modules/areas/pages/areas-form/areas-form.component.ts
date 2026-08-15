import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AreaService } from '../../../../core/services/area.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { NOMBRES_AREA, formatearNombreArea } from '../../../../core/models/area.model';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-areas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './areas-form.component.html',
  styleUrls: ['./areas-form.component.css']
})
export class AreasFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private areaService = inject(AreaService);
  private bomberoService = inject(BomberoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // Signals para control de estado de UI
  isEditMode = signal(false);
  loading = signal(false);
  submitting = signal(false);

  public areaId: number | null = null;
  private subscriptions: Subscription = new Subscription();

  // Enums y helpers globales
  nombresArea = NOMBRES_AREA;
  formatearNombreArea = formatearNombreArea;

  // Colecciones de datos para autocompletar
  bomberos: Bombero[] = [];
  filteredBomberos1: Bombero[] = [];
  filteredBomberos2: Bombero[] = [];

  // ========== NUEVO: Fechas mínimas ==========
  fechaMinimaInicio = '2026-01-01';
  fechaMinimaFin = '';
  // ========== Mapa de bomberos ya asignados (para mostrar advertencia) ==========
  bomberosAsignados = new Map<number, string>(); // id -> mensaje

  // Formulario reactivo 
  areaForm: FormGroup = this.fb.group({
    nombreArea: ['', Validators.required],
    encargado1Id: [null, Validators.required],
    encargado2Id: [null],
    // ✅ CORREGIDO: Validadores en array como segundo argumento
    fechaInicio: ['', [
      Validators.required,
      this.fechaInicioMayorA2026.bind(this)
    ]],
    fechaFin: [null, [
      this.fechaFinMayorAInicio.bind(this)
    ]],
    observaciones: ['', Validators.maxLength(500)],
    activo: [true, Validators.required]
  }, {
    // ✅ NUEVO: Validadores grupales
    validators: [
      this.fechasValidas.bind(this)
    ]
  });

  ngOnInit(): void {
    this.cargarBomberos();

    this.areaForm.get('fechaInicio')?.valueChanges.subscribe((fechaInicio: string) => {
      this.actualizarFechaMinimaFin(fechaInicio);
    });

    this.subscriptions.add(
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode.set(true);
          this.areaId = Number(params['id']);
          this.loadArea();
        }
      })
    );
  }

  //Valida que la fecha de inicio sea >= 2026

  fechaInicioMayorA2026(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const fecha = new Date(control.value);
    const anio = fecha.getFullYear();
    
    if (anio < 2026) {
      return { fechaInicioAntigua: true };
    }
    return null;
  }

  /**
   * Valida que la fecha de fin sea mayor a la fecha de inicio
   */
  fechaFinMayorAInicio(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const fechaFin = new Date(control.value);
    const fechaInicio = this.areaForm?.get('fechaInicio')?.value;
    
    if (!fechaInicio) return null;
    
    const fechaInicioDate = new Date(fechaInicio);
    
    if (fechaFin <= fechaInicioDate) {
      return { fechaFinAnteriorOIgual: true };
    }
    return null;
  }

  /**
   * Validación grupal de fechas
   */
  fechasValidas(group: FormGroup): ValidationErrors | null {
    const fechaInicio = group.get('fechaInicio')?.value;
    const fechaFin = group.get('fechaFin')?.value;
    
    if (!fechaInicio || !fechaFin) return null;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (inicio.getFullYear() < 2026) {
      return { fechaInicioAntigua: true };
    }
    
    if (fin <= inicio) {
      return { fechaFinAnteriorOIgual: true };
    }
    
    return null;
  }

  // ========== NUEVO: ACTUALIZAR FECHA MÍNIMA DE FIN ==========
  actualizarFechaMinimaFin(fechaInicio: string): void {
    if (!fechaInicio) {
      this.fechaMinimaFin = '';
      return;
    }
    
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + 1); // Sumar 1 día
    
    this.fechaMinimaFin = fecha.toISOString().split('T')[0];
    
    // Forzar revalidación del campo fechaFin
    this.areaForm.get('fechaFin')?.updateValueAndValidity();
  }
  // ========== CARGA DE BOMBEROS ==========
  private cargarBomberos(): void {
    this.subscriptions.add(
      this.bomberoService.getAll().subscribe({
        next: (data) => {
          this.bomberos = data;
          this.filteredBomberos1 = [];
          this.filteredBomberos2 = [];
        },
        error: () => {
          this.toastr.error('Error cargando catálogo de bomberos', 'Error');
        }
      })
    );
  }

  // ========== MÉTODOS DE AUTOSUGERENCIA ==========

  public ejecutarFiltro1(texto: string): void {
    const search = texto.trim().toLowerCase();
    if (!search) {
      this.filteredBomberos1 = [];
      return;
    }
    this.filteredBomberos1 = this.bomberos.filter(b => 
      this.getBomberoDisplay(b).toLowerCase().includes(search)
    );
  }

  public ejecutarFiltro2(texto: string): void {
    const search = texto.trim().toLowerCase();
    if (!search) {
      this.filteredBomberos2 = [];
      return;
    }
    const principalId = this.areaForm.get('encargado1Id')?.value;
    this.filteredBomberos2 = this.bomberos.filter(b => 
      this.getBomberoDisplay(b).toLowerCase().includes(search) && b.id !== principalId
    );
  }

  public seleccionarEncargado1(bombero: Bombero): void {
    // Verificar si el bombero ya está asignado a otra área
    if (this.bomberosAsignados.has(bombero.id!)) {
      this.toastr.warning(
        `El bombero ${this.getBomberoDisplay(bombero)} ya está asignado como encargado en otra área. ` +
        `Un bombero solo puede ser encargado de un área.`,
        'No disponible'
      );
      return;
    }

    this.areaForm.patchValue({ encargado1Id: bombero.id });
    this.areaForm.get('encargado1Id')?.markAsTouched();
    this.filteredBomberos1 = [];
    
    // Si el mismo bombero estaba seleccionado como secundario, limpiarlo
    if (this.areaForm.get('encargado2Id')?.value === bombero.id) {
      this.limpiarEncargado2();
    }
  }

  public limpiarEncargado1(): void {
    this.areaForm.patchValue({ encargado1Id: null });
    this.filteredBomberos1 = [];
  }

    public seleccionarEncargado2(bombero: Bombero): void {
    // Verificar si el bombero ya está asignado a otra área
    if (this.bomberosAsignados.has(bombero.id!)) {
      this.toastr.warning(
        `El bombero ${this.getBomberoDisplay(bombero)} ya está asignado como encargado en otra área. ` +
        `Un bombero solo puede ser encargado de un área.`,
        'No disponible'
      );
      return;
    }

    this.areaForm.patchValue({ encargado2Id: bombero.id });
    this.areaForm.get('encargado2Id')?.markAsTouched();
    this.filteredBomberos2 = [];
  }


  public limpiarEncargado2(): void {
    this.areaForm.patchValue({ encargado2Id: null });
    this.filteredBomberos2 = [];
  }

    // ========== HELPERS ==========

  public getBomberoDisplay(bombero: Bombero): string {
    return `${bombero.codigoCgbvp} - ${bombero.grado} ${bombero.nombre} ${bombero.apellido}`;
  }

  public getBomberoById(id: number): string {
    const bombero = this.bomberos.find(b => b.id === id);
    return bombero ? this.getBomberoDisplay(bombero) : 'Cargando...';
  }

  private loadArea(): void {
    if (!this.areaId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.areaService.getById(this.areaId).subscribe({
        next: (area) => {
          const fechaInicio = this.formatDateForInput(area.fechaInicio);
          
          this.areaForm.patchValue({
            nombreArea: area.nombreArea,
            encargado1Id: area.encargado1Id,
            encargado2Id: area.encargado2Id || null,
            fechaInicio: fechaInicio,
            fechaFin: area.fechaFin ? this.formatDateForInput(area.fechaFin) : null,
            observaciones: area.observaciones || '',
            activo: area.activo
          });
                    // ========== MARCAR BOMBEROS ASIGNADOS ==========
          this.cargarBomberosAsignados(area.encargado1Id, area.encargado2Id);
          // ========== NUEVO: Actualizar fecha mínima de fin al cargar ==========
          this.actualizarFechaMinimaFin(fechaInicio);
          
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el área solicitada', 'Error');
          this.loading.set(false);
          this.router.navigate(['/areas']);
        }
      })
    );
  }

    // ========== NUEVO: CARGAR BOMBEROS ASIGNADOS ==========

  private cargarBomberosAsignados(encargado1Id: number, encargado2Id?: number | null): void {
    this.bomberosAsignados.clear();
    
    // Cargar todos los bomberos y verificar cuáles están asignados
    this.subscriptions.add(
      this.areaService.getAll().subscribe({
        next: (areas) => {
          // Filtrar solo áreas activas y excluir el área actual
          const areasActivas = areas.filter(a => a.activo === true && a.id !== this.areaId);
          
          areasActivas.forEach(area => {
            // Marcar encargado1
            if (area.encargado1Id) {
              const nombre = this.getBomberoById(area.encargado1Id);
              this.bomberosAsignados.set(area.encargado1Id, `Encargado principal de: ${area.nombreArea}`);
            }
            // Marcar encargado2
            if (area.encargado2Id) {
              const nombre = this.getBomberoById(area.encargado2Id);
              this.bomberosAsignados.set(area.encargado2Id, `Encargado secundario de: ${area.nombreArea}`);
            }
          });
          
          // Si estamos en edición, remover los encargados actuales de la lista de asignados
          if (encargado1Id) {
            this.bomberosAsignados.delete(encargado1Id);
          }
          if (encargado2Id) {
            this.bomberosAsignados.delete(encargado2Id);
          }
        },
        error: () => {
          // Si falla, continuar (el backend validará)
        }
      })
    );
  }

  private formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  public onSubmit(): void {
    if (this.areaForm.invalid) {
      this.areaForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos correctamente', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.areaForm.value;

    // Validación adicional: encargado1 ≠ encargado2
    if (formValue.encargado1Id === formValue.encargado2Id && formValue.encargado1Id !== null) {
      this.toastr.warning('El encargado principal y secundario no pueden ser la misma persona', 'Validación');
      this.submitting.set(false);
      return;
    }

    // Validación: verificar que los encargados no estén asignados
    const encargado1Asignado = this.bomberosAsignados.has(formValue.encargado1Id);
    const encargado2Asignado = formValue.encargado2Id ? this.bomberosAsignados.has(formValue.encargado2Id) : false;
    if (encargado1Asignado) {
      this.toastr.warning(
        `El bombero seleccionado como encargado principal ya está asignado a otra área. ` +
        `Un bombero solo puede ser encargado de un área.`,
        'Validación'
      );
      this.submitting.set(false);
      return;
    }

    if (encargado2Asignado) {
      this.toastr.warning(
        `El bombero seleccionado como encargado secundario ya está asignado a otra área. ` +
        `Un bombero solo puede ser encargado de un área.`,
        'Validación'
      );
      this.submitting.set(false);
      return;
    }

    if (this.isEditMode() && this.areaId) {
      this.subscriptions.add(
        this.areaService.update(this.areaId, formValue).subscribe({
          next: () => {
            this.toastr.success('Área actualizada correctamente', 'Éxito');
            this.router.navigate(['/areas', this.areaId]);
            this.submitting.set(false);
          },
          error: (error) => {
            // Mostrar mensaje exacto del backend
            const mensaje = error.error?.message || error.message || 'Error actualizando el área';
            this.toastr.error(mensaje, 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.areaService.create(formValue).subscribe({
          next: (area) => {
            this.toastr.success('Área creada correctamente', 'Éxito');
            this.router.navigate(['/areas', area.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            // Mostrar mensaje exacto del backend
            const mensaje = error.error?.message || error.message || 'Error creando el área';
            this.toastr.error(mensaje, 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  public cancelar(): void {
    if (this.isEditMode() && this.areaId) {
      this.router.navigate(['/areas', this.areaId]);
    } else {
      this.router.navigate(['/areas']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
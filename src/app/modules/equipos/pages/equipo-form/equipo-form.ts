import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core'; // 💡 Importado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EquipoService } from '../../../../core/services/equipo.service';
import { TipoEquipo, EstadoEquipo } from '../../../../core/models/equipo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-equipo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './equipo-form.html',
  styleUrls: ['./equipo-form.css']
})
export class EquipoForm implements OnInit, OnDestroy {
  //  Inyección de dependencias moderna con inject() sin constructores rígidos
  private fb = inject(FormBuilder);
  private equipoService = inject(EquipoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdRef = inject(ChangeDetectorRef); //  Para forzar la actualización de la vista

  equipoForm: FormGroup;
  tipos: TipoEquipo[] = [];
  estados: EstadoEquipo[] = [];
  isEditMode = false;
  equipoId: number | null = null;
  loading = false;
  submitting = false;
  private subscriptions: Subscription = new Subscription();

  // Listas estáticas para alimentar las opciones desplegables del formulario
  marcasSugeridas = ['Rosenbauer', 'Waterous', 'Hale', 'Akron Brass', 'Scott', 'Dräger', 'MSA', 'Bullard'];
  modelosSugeridas = ['Especializado Contra Incendios', 'Manguera de Alta Presión', 'ERA (Equipo de Respiración)', 'EPP (Traje Estructural)', 'Boquilla Regulable'];
  estadosDisponibles: string[] = ['OPERATIVO', 'EN_MANTENIMIENTO', 'DADO_BAJA', 'FUERA_DE_SERVICIO'];

  constructor() {
    this.equipoForm = this.fb.group({
      codigoInterno: ['', [Validators.required, Validators.maxLength(50)]],
      numeroSerie: ['', [Validators.required, Validators.maxLength(100)]],
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      area: ['', Validators.required],
      marca: ['', Validators.maxLength(100)],
      modelo: ['', Validators.maxLength(100)],
      fechaCompra: [''],
      vidaUtilAnios: [null],
      ubicacionActual: [''],
      tipoEquipoId: [null, Validators.required],
      areaId: [null, Validators.required],
      estadoEquipoNombre: ['OPERATIVO', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.loadTiposEstados();
    
    // Escuchar parámetros de ruta asíncronos de forma segura
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.equipoId = Number(params['id']);
          this.loadEquipo();
        }
      })
    );
  }

  loadTiposEstados(): void {
    this.loading = true;
    
    this.subscriptions.add(
      this.equipoService.getTipos().subscribe({
        next: (tipos) => {
          this.tipos = tipos;
          this.loading = false;
          this.cdRef.detectChanges(); // Despierta a Angular al recibir la lista de tipos de API
        },
        error: () => {
          this.toastr.error('Error cargando tipos de equipo', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
        }
      })
    );

    this.subscriptions.add(
      this.equipoService.getEstados().subscribe({
        next: (estados) => {
          this.estados = estados;
          this.cdRef.detectChanges();
        },
        error: () => {
          this.toastr.error('Error cargando estados de equipo', 'Error');
        }
      })
    );
  }

  loadEquipo(): void {
    if (!this.equipoId) return;
    this.loading = true;
    this.cdRef.detectChanges();

    this.subscriptions.add(
      this.equipoService.getById(this.equipoId).subscribe({
        next: (equipo) => {
          this.equipoForm.patchValue({
            codigoInterno: equipo.codigoInterno,
            numeroSerie: equipo.numeroSerie,
            nombre: equipo.nombre,
            area: equipo.area,
            marca: equipo.marca || '',
            modelo: equipo.modelo || '',
            fechaCompra: equipo.fechaCompra || '',
            vidaUtilAnios: equipo.vidaUtilAnios || null,
            ubicacionActual: equipo.ubicacionActual || '',
            tipoEquipoId: equipo.tipoEquipoId,
            areaId: equipo.areaId,
            estadoEquipoNombre: equipo.estadoEquipoNombre || 'OPERATIVO'
          });
          this.loading = false;
          this.cdRef.detectChanges(); //  Despierta a Angular tras rellenar el formulario de edición
        },
        error: () => {
          this.toastr.error('Error cargando el equipo', 'Error');
          this.loading = false;
          this.cdRef.detectChanges();
          this.router.navigate(['/equipos']);
        }
      })
    );
  }

  onSubmit(): void {
    if (this.equipoForm.invalid) {
      this.equipoForm.markAllAsTouched();
      this.toastr.warning('Por favor complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting = true;
    this.cdRef.detectChanges();
    const formValue = this.equipoForm.value;
    // Tratamiento seguro de cadenas vacías para tipos primitivos del backend
    if (formValue.vidaUtilAnios === '') formValue.vidaUtilAnios = null;
    if (formValue.fechaCompra === '') formValue.fechaCompra = null;
    if (formValue.tipoEquipoId === 'null') formValue.tipoEquipoId = null;

    if (this.isEditMode && this.equipoId) {
      this.subscriptions.add(
        this.equipoService.update(this.equipoId, formValue).subscribe({
          next: () => {
            this.toastr.success('Equipo actualizado correctamente', 'Éxito');
            this.router.navigate(['/equipos']);
          },
          error: (error) => {
            console.error('Error actualizando equipo:', error);
            this.toastr.error('Error actualizando el equipo', 'Error');
            this.submitting = false;
            this.cdRef.detectChanges();
          }
        })
      );
    }
    else {
      // CORREGIDO: Enviamos formValue directamente ya que contiene el campo estadoEquipoNombre del select
      this.subscriptions.add(
        this.equipoService.create(formValue).subscribe({ 
          next: () => {
            this.toastr.success('Equipo creado correctamente', 'Éxito');
            this.router.navigate(['/equipos']);
          },
          error: (error) => {
            console.error('Error creando equipo:', error);
            this.toastr.error('Error creando el equipo', 'Error');
            this.submitting = false;
            this.cdRef.detectChanges();
          }
        })
      );
    }
  }

  cancelar(): void {
    this.router.navigate(['/equipos']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

import { Component, OnInit, OnDestroy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BomberoService } from '../../../../core/services/bombero.service';
import { ESTADOS_BOMBERO, GRADOS_BOMBERO, TIPOS_CARGO, TIPOS_SANGRE,  COMPANIAS_BOMBERO, TIPOS_VEHICULO_LICENCIA, TIPOS_LICENCIA, formatearCompania, formatearTipoLicencia, formatearTipoVehiculo  } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';
import { ModalMotivoComponent } from '../../components/modal-motivo/modal-motivo.component';

@Component({
  selector: 'app-bomberos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalMotivoComponent],
  templateUrl: './bomberos-form.html',
  styleUrls: ['./bomberos-form.css']
})
export class BomberosForm implements OnInit, OnDestroy {
  // Inyección moderna
  private fb = inject(FormBuilder);
  private bomberoService = inject(BomberoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

   // Referencia al modal hijo
  @ViewChild(ModalMotivoComponent) modalMotivo!: ModalMotivoComponent;

  // Signals
  isEditMode = signal(false);
  bomberoId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  estadoActual = signal<string>('');
  modalAbierto = signal<boolean>(false);

    // Variable para controlar el estado pendiente del modal
  private estadoPendiente: string = '';
  private subscriptions: Subscription = new Subscription();

  // Enums para desplegables
  estadosDisponibles = ESTADOS_BOMBERO;
  gradosDisponibles = GRADOS_BOMBERO;
  tiposSangre = TIPOS_SANGRE; 
  tiposCargo = TIPOS_CARGO; 
  companiasDisponibles = COMPANIAS_BOMBERO;         
  tiposVehiculoLicencia = TIPOS_VEHICULO_LICENCIA; 
  tiposLicencia = TIPOS_LICENCIA;                   
  formatearCompania = formatearCompania; 
  formatearTipoVehiculo = formatearTipoVehiculo;
  formatearTipoLicencia = formatearTipoLicencia;        
     
  // Formulario reactivo con todos los campos
  bomberoForm: FormGroup = this.fb.group({
    codigoCgbvp: ['', [
      Validators.required,
      Validators.pattern(/^[A-Za-z][0-9]{5}$/) // A19066
    ]],
    compania: ['', [Validators.required]],
    fechaIncorporacion: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    dni: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{8}$/) // 8 dígitos
    ]],
    fechaNacimiento: ['', Validators.required],
    tipoSangre: ['', Validators.required],
    talla: ['', [Validators.required, Validators.min(1.50), Validators.max(2.10)]],
    peso: ['', [Validators.required, Validators.min(50), Validators.max(120)]],
    estado: ['ACTIVO', Validators.required],
    grado: ['', Validators.required],
    telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]], // 9 dígitos opcional
    telefonoEmergencia: ['', [Validators.pattern(/^[0-9]{9}$/)]], // 9 dígitos opcional
    tieneCargo: [false, Validators.required],             
    tipoCargo: ['NINGUNO', Validators.required],          
    fechaInicioCargo: [''],                               
    fechaFinCargo: [''],                               
    correo: ['', [Validators.email, Validators.maxLength(100)]],                   
    licencia: [false, Validators.required],                                        
    tipoLicencia: ['NINGUNO', Validators.required],                                
    tipoVehiculoLicencia: ['NINGUNO', Validators.required],                        
    limitacionSalud: ['', Validators.maxLength(500)],    
    tieneLimitacionSalud: [false, Validators.required],   
    motivoEstado: [null],                
  });


  ngOnInit(): void {
       this.escucharCambiosSwitches();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.bomberoId = Number(params['id']);
        this.loadBombero();
      } else {
        // Ejecutar lógica por defecto para deshabilitar en modo creación inicial
        this.gestionarControlesCargo(false);
        this.gestionarControlesLicencia(false);
        this.gestionarControlesSalud(false);
        this.estadoActual.set('ACTIVO');
      }
    });
  }

  
    // Método dinámico para escuchar clics en la interfaz (Front-End)
  private escucharCambiosSwitches(): void {
    // Escuchar interruptor de Cargos
    this.subscriptions.add(
      this.bomberoForm.get('tieneCargo')?.valueChanges.subscribe((tieneCargo: boolean) => {
        this.gestionarControlesCargo(tieneCargo);
      })
    );

    // Escuchar interruptor de Licencias
    this.subscriptions.add(
      this.bomberoForm.get('licencia')?.valueChanges.subscribe((tieneLicencia: boolean) => {
        this.gestionarControlesLicencia(tieneLicencia);
      })
    );

    // Escuchar interruptor de Limitaciones de Salud
    this.subscriptions.add(
      this.bomberoForm.get('tieneLimitacionSalud')?.valueChanges.subscribe((tieneLimitacion: boolean) => {
        this.gestionarControlesSalud(tieneLimitacion);
      })
    );
  }

  private gestionarControlesCargo(activar: boolean): void {
    const controles = ['tipoCargo', 'fechaInicioCargo', 'fechaFinCargo'];
    controles.forEach(control => {
      const ctrl = this.bomberoForm.get(control);
      if (!activar) {
        ctrl?.disable({ emitEvent: false });
        if(control === 'tipoCargo') ctrl?.setValue('NINGUNO', { emitEvent: false });
        else ctrl?.setValue('', { emitEvent: false });
      } else {
        ctrl?.enable({ emitEvent: false });
      }
    });
  }

  private gestionarControlesLicencia(activar: boolean): void {
    const controles = ['tipoLicencia', 'tipoVehiculoLicencia'];
    controles.forEach(control => {
      const ctrl = this.bomberoForm.get(control);
      if (!activar) {
        ctrl?.disable({ emitEvent: false });
        ctrl?.setValue('NINGUNO', { emitEvent: false });
      } else {
        ctrl?.enable({ emitEvent: false });
      }
    });
  }

    private gestionarControlesSalud(activar: boolean): void {
    const ctrl = this.bomberoForm.get('limitacionSalud');
    if (!activar) {
      ctrl?.disable({ emitEvent: false });
      ctrl?.setValue('', { emitEvent: false });
    } else {
      ctrl?.enable({ emitEvent: false });
    }
  }

  loadBombero(): void {
    if (!this.bomberoId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.bomberoService.getById(this.bomberoId).subscribe({
        next: (bombero) => {
          // Guardar estado actual para el modal
          this.estadoActual.set(bombero.estado);
          // Parchear todos los campos del formulario
          this.bomberoForm.patchValue({
            codigoCgbvp: bombero.codigoCgbvp,
            compania: bombero.compania,
            fechaIncorporacion: this.formatDateForInput(bombero.fechaIncorporacion),
            nombre: bombero.nombre,
            apellido: bombero.apellido,
            dni: bombero.dni,
            fechaNacimiento: this.formatDateForInput(bombero.fechaNacimiento),
            tipoSangre: bombero.tipoSangre,
            talla: bombero.talla,           
            peso: bombero.peso,    
            grado: bombero.grado,
            telefono: bombero.telefono || '',
            telefonoEmergencia: bombero.telefonoEmergencia || '',
            correo: bombero.correo || '',  
            estado: bombero.estado,
            tieneCargo: bombero.tieneCargo,              
            tipoCargo: bombero.tipoCargo || 'NINGUNO',  
            fechaInicioCargo: bombero.fechaInicioCargo ? this.formatDateForInput(bombero.fechaInicioCargo) : '', 
            fechaFinCargo: bombero.fechaFinCargo ? this.formatDateForInput(bombero.fechaFinCargo) : '',
            licencia: bombero.licencia || false,
            tipoLicencia: bombero.tipoLicencia || 'NINGUNO', 
            tipoVehiculoLicencia: bombero.tipoVehiculoLicencia || 'NINGUNO', 
            limitacionSalud: bombero.limitacionSalud || '' ,
            motivoEstado: bombero.motivoEstado || null

          });


          // Determinar si el switch debe iniciar activo en base a si el texto tiene contenido
          const tieneSalud = !!bombero.limitacionSalud;
          this.bomberoForm.get('tieneLimitacionSalud')?.setValue(tieneSalud, { emitEvent: false });
          this.gestionarControlesSalud(tieneSalud);
          
        // 2. Controlas visualmente los inputs del cargo según el estado booleano
          const controlesCargo = ['tipoCargo', 'fechaInicioCargo', 'fechaFinCargo'];
          if (!bombero.tieneCargo) {
            controlesCargo.forEach(control => this.bomberoForm.get(control)?.disable());
          } else {
            controlesCargo.forEach(control => this.bomberoForm.get(control)?.enable());
          }

          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el bombero', 'Error');
          this.loading.set(false);
          this.router.navigate(['/bomberos']);
        }
      })
    );
  }

  // Formatear fecha para input type="date" (YYYY-MM-DD)
  private formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

// Método que se ejecuta al cambiar el estado en el select
  onEstadoChange(): void {
    const nuevoEstado = this.bomberoForm.get('estado')?.value;
    const estadoAnterior = this.estadoActual();
    
    if (nuevoEstado === estadoAnterior) return;
    
    if (nuevoEstado === 'ACTIVO') {
      this.bomberoForm.patchValue({ motivoEstado: null }, { emitEvent: false });
      this.estadoActual.set('ACTIVO');
      return;
    }
    
    if (nuevoEstado === 'RESERVA' || nuevoEstado === 'BAJA') {
      this.estadoPendiente = nuevoEstado;
      this.modalMotivo.titulo = nuevoEstado === 'RESERVA' ? 'Motivo de Reserva' : 'Motivo de Baja';
      this.modalMotivo.estado = nuevoEstado;
      
      // Bloqueamos el fondo antes de abrir para asegurar la accesibilidad
      this.modalAbierto.set(true);
      this.modalMotivo.abrir();
    }
  }


  // RESPUESTA DEL MODAL: Guarda exitosamente
  onMotivoConfirmado(motivo: string): void {
    this.modalAbierto.set(false);

    if (this.estadoPendiente) {
      this.bomberoForm.patchValue({
        motivoEstado: motivo
      }, { emitEvent: false }); // { emitEvent: false } previene loops en modo creación
      
      this.estadoActual.set(this.estadoPendiente);
      this.estadoPendiente = '';
    }
  }

 //Método que se ejecuta cuando el modal se cierra sin confirmar
  onMotivoCancelado(): void {
     this.modalAbierto.set(false);
    // Restaurar estado anterior de forma segura evitando loops de eventos
    const estadoARestaurar = this.estadoActual() || 'ACTIVO';
    this.bomberoForm.patchValue({
      estado: estadoARestaurar
    }, { emitEvent: false });
    
    this.estadoPendiente = '';
  }

  onSubmit(): void {

    const estado = this.bomberoForm.get('estado')?.value;
    const motivoEstado = this.bomberoForm.get('motivoEstado')?.value;

    if ((estado === 'RESERVA' || estado === 'BAJA') && (!motivoEstado || !motivoEstado.trim())) {
    this.toastr.warning(`Debe ingresar el motivo de ${estado === 'RESERVA' ? 'reserva' : 'baja'}`, 'Campo requerido');
    return;
    }
  

    if (this.bomberoForm.invalid) {
      this.bomberoForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    // Obtener valores incluyendo los deshabilitados
    const formValue = this.bomberoForm.getRawValue(); 

    // Si estado es ACTIVO, limpiar motivo
    if (estado === 'ACTIVO') {
      formValue.motivoEstado = null;
    }
    
    if (this.isEditMode() && this.bomberoId) {
      this.subscriptions.add(
        this.bomberoService.update(this.bomberoId, formValue).subscribe({
          next: () => {
            this.toastr.success('Bombero actualizado correctamente', 'Éxito');
            this.router.navigate(['/bomberos', this.bomberoId]);
            this.submitting.set(false);
          },
          error: () => {
            this.toastr.error('Error actualizando el bombero', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.bomberoService.create(formValue).subscribe({
          next: (bombero) => {
            this.toastr.success('Bombero creado correctamente', 'Éxito');
            this.router.navigate(['/bomberos', bombero.id]);
            this.submitting.set(false);
          },
          error: () => {
            this.toastr.error('Error creando el bombero', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }

  }


  cancelar(): void {
    if (this.isEditMode() && this.bomberoId) {
      this.router.navigate(['/bomberos', this.bomberoId]);
    } else {
      this.router.navigate(['/bomberos']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
import { Component, Input, OnInit, Output, EventEmitter, forwardRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { Ubicacion, formatearNombreUbicacion } from '../../../core/models/ubicacion.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-ubicacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  // 🌟 CORRECCIÓN 1: Agregar el proveedor para que funcione como un input nativo de Angular Forms
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectUbicacionComponent),
      multi: true
    }
  ],
  template: `
    <div class="mb-2">
      <label class="form-label fw-semibold" [for]="id">
        {{ label }} @if (required) { <span class="text-danger">*</span> }
      </label>
      <select class="form-select shadow-sm" 
              [id]="id"
              [class.is-invalid]="invalid && touched"
              [value]="value"
              (change)="onSelectChange($event)"
              (blur)="onBlur()"
              [disabled]="disabled">
        <option value="" disabled selected>Seleccione ubicación...</option>
        @for (ubicacion of ubicaciones; track ubicacion.id) {
          <option [value]="ubicacion.id">
            {{ formatearNombreUbicacion(ubicacion.nombreUbicacion) }}
            @if (ubicacion.codigo) { ({{ ubicacion.codigo }}) }
          </option>
        }
      </select>
      @if (invalid && touched) {
        <div class="invalid-feedback d-block">{{ errorMessage }}</div>
      }
    </div>
  `
})
export class SelectUbicacionComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private ubicacionService = inject(UbicacionService);

  @Input() label: string = 'Ubicación';
  @Input() id: string = 'ubicacionId';
  @Input() required: boolean = false;
  @Input() invalid: boolean = false;
  @Input() touched: boolean = false;
  @Input() errorMessage: string = 'La ubicación es requerida';
  @Input() disabled: boolean = false;
  @Input() soloActivas: boolean = true;
  
  // 🌟 CORRECCIÓN 2: Se mantiene un único @Input() value y se repara el EventEmitter desde @angular/core
  @Input() value: any = ''; 
  @Output() valueChange = new EventEmitter<any>();
  
  ubicaciones: Ubicacion[] = [];
  private subscriptions: Subscription = new Subscription();
  
  // Handlers para ControlValueAccessor
  onChange: any = () => {};
  onTouched: any = () => {};

  formatearNombreUbicacion = formatearNombreUbicacion;

  ngOnInit(): void {
    this.subscriptions.add(
      this.ubicacionService.getAll().subscribe({
        next: (ubicaciones) => {
          this.ubicaciones = this.soloActivas 
            ? ubicaciones.filter(u => u.activa === true) 
            : ubicaciones;
        },
        error: () => {
          this.ubicaciones = [];
        }
      })
    );
  }

  // 🌟 CORRECCIÓN 3: Método intermedio para emitir eventos de cambio de forma limpia y segura
  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const val = target.value ? Number(target.value) : null;
    this.value = val;
    this.onChange(val);
    this.valueChange.emit(val);
  }

  onBlur(): void {
    this.onTouched();
  }

  // Métodos obligatorios de ControlValueAccessor
  writeValue(value: any): void { 
    this.value = value || ''; 
  }
  
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

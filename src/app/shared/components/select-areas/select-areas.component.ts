import { Component, Input, OnInit, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { AreaService } from '../../../core/services/area.service';
import { Area } from '../../../core/models/area.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-areas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-2">
      <label class="form-label fw-semibold" [for]="id">
        {{ label }} @if (required) { <span class="text-danger">*</span> }
      </label>
      <select class="form-select shadow-sm" 
              [id]="id"
              [class.is-invalid]="invalid && touched"
              [value]="value"
              (change)="onChange($event)"
              (blur)="onTouched()"
              [disabled]="disabled">
        <option value="" disabled>Seleccione área...</option>
        @for (area of areas; track area.id) {
          <option [value]="area.id">{{ formatearArea(area.nombreArea) }}</option>
        }
      </select>
      @if (invalid && touched) {
        <div class="invalid-feedback">{{ errorMessage }}</div>
      }
    </div>
  `
})
export class SelectAreasComponent implements ControlValueAccessor, OnInit {
  private areaService = inject(AreaService);

  @Input() label: string = 'Área';
  @Input() id: string = 'areaId';
  @Input() required: boolean = true;
  @Input() invalid: boolean = false;
  @Input() touched: boolean = false;
  @Input() errorMessage: string = 'El área es requerida';
  @Input() disabled: boolean = false;
  @Input() soloActivas: boolean = true;

  areas: Area[] = [];
  value: number | null = null;
  private subscriptions: Subscription = new Subscription();
  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit(): void {
    this.subscriptions.add(
      this.areaService.getAll().subscribe({
        next: (areas) => {
          this.areas = this.soloActivas ? areas.filter(a => a.activo) : areas;
        }
      })
    );
  }

  formatearArea(nombre: string): string {
    return nombre.replace('AREA_', 'Área de ')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letra) => letra.toUpperCase());
  }

  writeValue(value: any): void { this.value = value || null; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
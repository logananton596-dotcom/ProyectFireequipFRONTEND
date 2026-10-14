import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-enum',
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
        <option value="" disabled>Seleccione {{ label }}...</option>
        @for (option of options; track option) {
          <option [value]="option">{{ formatear(option) }}</option>
        }
      </select>
      @if (invalid && touched) {
        <div class="invalid-feedback">{{ errorMessage }}</div>
      }
    </div>
  `
})
export class SelectEnumComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() options: string[] = [];
  @Input() formatear: (value: string) => string = (v) => v;
  @Input() required: boolean = false;
  @Input() invalid: boolean = false;
  @Input() touched: boolean = false;
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;

  value: string = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void { this.value = value || ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
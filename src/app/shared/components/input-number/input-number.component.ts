import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-number',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-2">
      <label class="form-label fw-semibold" [for]="id">
        {{ label }} @if (required) { <span class="text-danger">*</span> }
      </label>
      <input type="number" class="form-control shadow-sm" 
             [id]="id"
             [placeholder]="placeholder"
             [min]="min"
             [max]="max"
             [step]="step"
             [class.is-invalid]="invalid && touched"
             [value]="value"
             (input)="onChange($event)"
             (blur)="onTouched()"
             [disabled]="disabled">
      @if (invalid && touched) {
        <div class="invalid-feedback">{{ errorMessage }}</div>
      }
      @if (hint) {
        <small class="text-muted">{{ hint }}</small>
      }
    </div>
  `
})
export class InputNumberComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() placeholder: string = '';
  @Input() min: number = 0;
  @Input() max: number = 999;
  @Input() step: number = 1;
  @Input() required: boolean = false;
  @Input() invalid: boolean = false;
  @Input() touched: boolean = false;
  @Input() errorMessage: string = '';
  @Input() hint: string = '';
  @Input() disabled: boolean = false;

  value: number | null = null;
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void { this.value = value || null; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
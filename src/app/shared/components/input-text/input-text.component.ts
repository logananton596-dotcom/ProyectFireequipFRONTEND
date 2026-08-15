import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-2">
      <label class="form-label fw-semibold" [for]="id">
        {{ label }} @if (required) { <span class="text-danger">*</span> }
      </label>
      <input [type]="type" class="form-control shadow-sm" 
             [id]="id"
             [placeholder]="placeholder"
             [class.is-invalid]="invalid && touched"
             [value]="value"
             (input)="onChange($event)"
             (blur)="onTouched()"
             [disabled]="disabled">
      @if (invalid && touched) {
        <div class="invalid-feedback">{{ errorMessage }}</div>
      }
    </div>
  `
})
export class InputTextComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
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
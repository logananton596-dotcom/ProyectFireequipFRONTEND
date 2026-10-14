import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge shadow-sm px-3 py-2 fw-bold" [class]="badgeClass">
      {{ texto }}
    </span>
  `
})
export class EstadoBadgeComponent {
  @Input() texto: string = '';
  @Input() color: 'success' | 'warning' | 'danger' | 'secondary' | 'primary' | 'info' = 'secondary';

  get badgeClass(): string {
    const classes: Record<string, string> = {
      success: 'bg-success text-white',
      warning: 'bg-warning text-dark',
      danger: 'bg-danger text-white',
      secondary: 'bg-secondary text-white',
      primary: 'bg-primary text-white',
      info: 'bg-info text-white'
    };
    return classes[this.color] || classes['secondary'];
  }
}
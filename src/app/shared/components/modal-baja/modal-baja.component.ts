import { Component, Input, Output, EventEmitter, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-baja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" [id]="modalId" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ titulo }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" (click)="cerrar()"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted">Registre la información de baja para <strong>{{ nombre }}</strong></p>
            <div class="mb-3">
              <label class="form-label fw-semibold">Fecha de Baja *</label>
              <input type="date" class="form-control" [(ngModel)]="fechaBaja"
                     [class.is-invalid]="fechaBaja && !fechaBaja">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Motivo de Baja *</label>
              <textarea class="form-control" rows="3" [(ngModel)]="motivoBaja"
                        placeholder="Describa el motivo de baja..."
                        [class.is-invalid]="motivoBaja && !motivoBaja.trim()">
              </textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" 
                    [disabled]="!fechaBaja || !motivoBaja || !motivoBaja.trim()"
                    (click)="confirmar()">
              <i class="bi bi-check-lg me-1"></i> Confirmar Baja
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalBajaComponent implements AfterViewInit {
  @Input() modalId: string = 'modalBaja';
  @Input() titulo: string = 'Registrar Baja';
  @Input() nombre: string = '';
  @Output() bajaConfirmada = new EventEmitter<{ fechaBaja: string; motivoBaja: string }>();

  fechaBaja: string = '';
  motivoBaja: string = '';
  private modalInstance: any = null;

  ngAfterViewInit(): void {
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      this.modalInstance = new (window as any).bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
    }
  }

  abrir(): void {
    this.fechaBaja = '';
    this.motivoBaja = '';
    if (this.modalInstance) this.modalInstance.show();
  }

  cerrar(): void {
    if (this.modalInstance) this.modalInstance.hide();
  }

  confirmar(): void {
    if (this.fechaBaja && this.motivoBaja && this.motivoBaja.trim()) {
      this.bajaConfirmada.emit({
        fechaBaja: this.fechaBaja,
        motivoBaja: this.motivoBaja.trim()
      });
      this.cerrar();
    }
  }
}
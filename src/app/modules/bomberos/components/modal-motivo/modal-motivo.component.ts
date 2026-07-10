import { Component, Input, AfterViewInit, OnDestroy, ElementRef, viewChild, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-motivo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- 1. Agregamos una variable de plantilla #modalContainer en lugar de depender solo del ID -->
    <div #modalContainer class="modal fade" id="motivoModal" tabindex="-1" aria-labelledby="motivoModalLabel">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="motivoModalLabel">{{ titulo }}</h5>
            <button type="button" class="btn-close" (click)="salirSinConfirmar()" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted">Ingrese el motivo para cambiar el estado a <strong>{{ estado }}</strong></p>
            <div class="mb-3">
              <label class="form-label fw-semibold">Motivo *</label>
              <textarea class="form-control" 
                        [(ngModel)]="motivo" 
                        rows="4"
                        placeholder="Describa el motivo detalladamente..."
                        [class.is-invalid]="motivo !== null && motivo !== undefined && !motivo.trim()"></textarea>
              <div class="invalid-feedback" *ngIf="motivo !== null && motivo !== undefined && !motivo.trim()">
                El motivo es obligatorio
              </div>
              <small class="text-muted">Máximo 500 caracteres</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="salirSinConfirmar()">Cancelar</button>
            <button type="button" class="btn btn-primary" 
                    [disabled]="!motivo || !motivo.trim()"
                    (click)="confirmar()">
              <i class="bi bi-check-lg me-1"></i> Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal-motivo.component.css']
})
export class ModalMotivoComponent implements AfterViewInit, OnDestroy {
  @Input() titulo: string = '';
  @Input() estado: string = '';
  
  motivoConfirmado = output<string>();
  motivoCancelado = output<void>();
  
  motivo: string = '';
  private modalInstance: any = null;
  private fueConfirmado: boolean = false; 

  // 2. Captura moderna y ultra precisa del elemento usando un Signal ViewChild
  private modalElementRef = viewChild<ElementRef<HTMLDivElement>>('modalContainer');
  // Callback guardado para poder desvincular el listener de Bootstrap de forma limpia
  private hiddenModalCallback!: () => void;
  
  ngAfterViewInit(): void {
    // 3. Obtenemos el elemento nativo directamente desde la referencia de Angular v21
    const modalElement = this.modalElementRef()?.nativeElement;
    
    if (modalElement) {
      this.modalInstance = new (window as any).bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      this.hiddenModalCallback = () => {
        if (!this.fueConfirmado) {
          this.motivoCancelado.emit();
        }
      };

      modalElement.addEventListener('hidden.bs.modal', this.hiddenModalCallback);
    }
  }

  // 4. PASO CRÍTICO: Eliminamos los residuos del modal de la memoria del navegador al cambiar de ruta
  ngOnDestroy(): void {
    const modalElement = this.modalElementRef()?.nativeElement;
    if (modalElement && this.hiddenModalCallback) {
      modalElement.removeEventListener('hidden.bs.modal', this.hiddenModalCallback);
    }
    if (this.modalInstance) {
      this.modalInstance.dispose(); // Limpia por completo la instancia de Bootstrap de la memoria
    }
  }
  
  abrir(): void {
    if (this.modalInstance) {
      this.motivo = '';
      this.fueConfirmado = false; 
      this.modalInstance.show();
    }
  }

  confirmar(): void {
    if (this.motivo && this.motivo.trim()) {
      this.fueConfirmado = true; 
      this.motivoConfirmado.emit(this.motivo.trim());
      this.cerrar();
    }
  }

  salirSinConfirmar(): void {
    this.fueConfirmado = false;
    this.cerrar();
  }
  
  private cerrar(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }
}

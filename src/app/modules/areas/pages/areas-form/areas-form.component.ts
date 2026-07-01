import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AreaService } from '../../../../core/services/area.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-areas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './areas-form.component.html',
  styleUrls: ['./areas-form.component.css']
})
export class AreasFormComponent implements OnInit, OnDestroy {
  areaForm: FormGroup;
  isEditMode = signal(false);
  areaId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private areaService: AreaService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.areaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      encargado: ['', [Validators.required, Validators.maxLength(150)]],
      telefono: ['', Validators.maxLength(20)]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.areaId = Number(params['id']);
        this.loadArea();
      }
    });
  }

  loadArea(): void {
    if (!this.areaId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.areaService.getById(this.areaId).subscribe({
        next: (area) => {
          this.areaForm.patchValue({
            nombre: area.nombre,
            encargado: area.encargado,
            telefono: area.telefono || ''
          });
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el área', 'Error');
          this.loading.set(false);
          this.router.navigate(['/areas']);
        }
      })
    );
  }

  onSubmit(): void {
    if (this.areaForm.invalid) {
      this.areaForm.markAllAsTouched();
      this.toastr.warning('Por favor complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.areaForm.value;

    if (this.isEditMode() && this.areaId) {
      this.subscriptions.add(
        this.areaService.update(this.areaId, formValue).subscribe({
          next: () => {
            this.toastr.success('Área actualizada correctamente', 'Éxito');
            this.router.navigate(['/areas', this.areaId]);
          },
          error: () => {
            this.toastr.error('Error actualizando el área', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.areaService.create(formValue).subscribe({
          next: (area) => {
            this.toastr.success('Área creada correctamente', 'Éxito');
            this.router.navigate(['/areas', area.id]);
          },
          error: () => {
            this.toastr.error('Error creando el área', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.areaId) {
      this.router.navigate(['/areas', this.areaId]);
    } else {
      this.router.navigate(['/areas']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { EquipoService } from '../../../../core/services/equipo.service';
import { Equipo } from '../../../../core/models/equipo.model';

@Component({
  selector: 'app-mantenimiento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mantenimiento-form.html',
  styleUrls: ['./mantenimiento-form.css']
})
export class MantenimientoForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private mantenimientoService = inject(MantenimientoService);
  private equipoService = inject(EquipoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  mantenimientoForm: FormGroup;
  equipos = signal<Equipo[]>([]);
  isEditMode = signal(false);
  mantenimientoId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  private subscriptions: Subscription = new Subscription();

  constructor() {
    this.mantenimientoForm = this.fb.group({
      equipoId: ['', Validators.required],
      fecha: ['', Validators.required],
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      responsable: ['', [Validators.required, Validators.maxLength(200)]],
      fechaProximo: [''],
      fechaFin: ['']
    });
  }

  ngOnInit(): void {
    this.loadEquipos();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.mantenimientoId = Number(params['id']);
        this.loadMantenimiento();
      }
    });
  }

  loadEquipos(): void {
    this.subscriptions.add(
      this.equipoService.getAll().subscribe({
        next: (equipos) => {
          this.equipos.set(equipos);
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastr.error('Error cargando equipos', 'Error');
        }
      })
    );
  }

  loadMantenimiento(): void {
    if (!this.mantenimientoId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.mantenimientoService.getById(this.mantenimientoId).subscribe({
        next: (item) => {
          this.mantenimientoForm.patchValue({
            equipoId: item.equipoId,
            fecha: item.fecha,
            tipo: item.tipo,
            descripcion: item.descripcion,
            responsable: item.responsable,
            fechaProximo: item.fechaProximo || '',
            fechaFin: item.fechaFin || ''
          });
          this.loading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastr.error('Error cargando el mantenimiento', 'Error');
          this.loading.set(false);
          this.router.navigate(['/mantenimientos']);
          this.cdr.detectChanges();
        }
      })
    );
  }

  onSubmit(): void {
    if (this.mantenimientoForm.invalid) {
      this.mantenimientoForm.markAllAsTouched();
      this.toastr.warning('Por favor complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.mantenimientoForm.value;

    if (this.isEditMode() && this.mantenimientoId) {
      this.subscriptions.add(
        this.mantenimientoService.update(this.mantenimientoId, formValue).subscribe({
          next: () => {
            this.toastr.success('Mantenimiento actualizado correctamente', 'Éxito');
            this.router.navigate(['/mantenimientos', this.mantenimientoId]);
            this.cdr.detectChanges();
          },
          error: () => {
            this.toastr.error('Error actualizando el mantenimiento', 'Error');
            this.submitting.set(false);
            this.cdr.detectChanges();
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.mantenimientoService.create(formValue).subscribe({
          next: (item) => {
            this.toastr.success('Mantenimiento registrado correctamente', 'Éxito');
            this.router.navigate(['/mantenimientos', item.id]);
            this.cdr.detectChanges();
          },
          error: () => {
            this.toastr.error('Error registrando el mantenimiento', 'Error');
            this.submitting.set(false);
            this.cdr.detectChanges();
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.mantenimientoId) {
      this.router.navigate(['/mantenimientos', this.mantenimientoId]);
    } else {
      this.router.navigate(['/mantenimientos']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
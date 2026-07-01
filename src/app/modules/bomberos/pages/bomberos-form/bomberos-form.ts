import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bomberos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bomberos-form.html',
  styleUrls: ['./bomberos-form.css']
})
export class BomberosForm implements OnInit, OnDestroy {
  bomberoForm: FormGroup;
  isEditMode = signal(false);
  bomberoId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private bomberoService: BomberoService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.bomberoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(30)]],
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      grado: ['', [Validators.required, Validators.maxLength(50)]],
      telefono: ['', Validators.maxLength(20)],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.bomberoId = Number(params['id']);
        this.loadBombero();
      }
    });
  }

  loadBombero(): void {
    if (!this.bomberoId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.bomberoService.getById(this.bomberoId).subscribe({
        next: (bombero) => {
          this.bomberoForm.patchValue({
            codigo: bombero.codigo,
            nombre: bombero.nombre,
            grado: bombero.grado,
            telefono: bombero.telefono || '',
            activo: bombero.activo
          });
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el bombero', 'Error');
          this.loading.set(false);
          this.router.navigate(['/bomberos']);
        }
      })
    );
  }

  onSubmit(): void {
    if (this.bomberoForm.invalid) {
      this.bomberoForm.markAllAsTouched();
      this.toastr.warning('Por favor complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.bomberoForm.value;

    if (this.isEditMode() && this.bomberoId) {
      this.subscriptions.add(
        this.bomberoService.update(this.bomberoId, formValue).subscribe({
          next: () => {
            this.toastr.success('Bombero actualizado correctamente', 'Éxito');
            this.router.navigate(['/bomberos', this.bomberoId]);
          },
          error: () => {
            this.toastr.error('Error actualizando el bombero', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.bomberoService.create(formValue).subscribe({
          next: (bombero) => {
            this.toastr.success('Bombero creado correctamente', 'Éxito');
            this.router.navigate(['/bomberos', bombero.id]);
          },
          error: () => {
            this.toastr.error('Error creando el bombero', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.bomberoId) {
      this.router.navigate(['/bomberos', this.bomberoId]);
    } else {
      this.router.navigate(['/bomberos']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
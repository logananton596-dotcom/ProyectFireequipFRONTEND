import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CasilleroService } from '../../../../core/services/casillero.service';
import { BomberoService } from '../../../../core/services/bombero.service';
import { Bombero } from '../../../../core/models/bombero.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-casillero-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './casillero-form.component.html',
  styleUrls: ['./casillero-form.component.css']
})
export class CasilleroFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private casilleroService = inject(CasilleroService);
  private bomberoService = inject(BomberoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isEditMode = signal(false);
  casilleroId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  bomberos: Bombero[] = [];

  private subscriptions: Subscription = new Subscription();

  // Formulario
  casilleroForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    numero: ['', [Validators.required, Validators.maxLength(20)]],
    descripcion: ['', Validators.maxLength(200)],
    piso: ['', Validators.maxLength(50)],
    edificio: ['', Validators.maxLength(100)],
    capacidad: ['', [Validators.min(0)]],
    bomberoId: [null],
    activo: [true],
    observaciones: ['', Validators.maxLength(500)]
  });

  ngOnInit(): void {
    this.cargarBomberos();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.casilleroId = Number(params['id']);
        this.loadCasillero();
      }
    });
  }

  private cargarBomberos(): void {
    this.subscriptions.add(
      this.bomberoService.getActivos().subscribe({
        next: (data) => {
          this.bomberos = data;
        },
        error: () => {
          this.toastr.error('Error cargando bomberos', 'Error');
        }
      })
    );
  }

  loadCasillero(): void {
    if (!this.casilleroId) return;
    this.loading.set(true);
    this.subscriptions.add(
      this.casilleroService.getById(this.casilleroId).subscribe({
        next: (casillero) => {
          this.casilleroForm.patchValue({
            codigo: casillero.codigo,
            numero: casillero.numero,
            descripcion: casillero.descripcion || '',
            piso: casillero.piso || '',
            edificio: casillero.edificio || '',
            capacidad: casillero.capacidad || '',
            bomberoId: casillero.bomberoId || null,
            activo: casillero.activo,
            observaciones: casillero.observaciones || ''
          });
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Error cargando el casillero', 'Error');
          this.loading.set(false);
          this.router.navigate(['/casilleros']);
        }
      })
    );
  }

  getBomberoDisplay(bombero: Bombero): string {
    return `${bombero.codigoCgbvp} - ${bombero.grado} ${bombero.nombre} ${bombero.apellido}`;
  }

  onSubmit(): void {
    if (this.casilleroForm.invalid) {
      this.casilleroForm.markAllAsTouched();
      this.toastr.warning('Complete los campos requeridos', 'Formulario inválido');
      return;
    }

    this.submitting.set(true);
    const formValue = this.casilleroForm.value;

    if (this.isEditMode() && this.casilleroId) {
      this.subscriptions.add(
        this.casilleroService.update(this.casilleroId, formValue).subscribe({
          next: () => {
            this.toastr.success('Casillero actualizado correctamente', 'Éxito');
            this.router.navigate(['/casilleros', this.casilleroId]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error actualizando el casillero', 'Error');
            this.submitting.set(false);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.casilleroService.create(formValue).subscribe({
          next: (casillero) => {
            this.toastr.success('Casillero creado correctamente', 'Éxito');
            this.router.navigate(['/casilleros', casillero.id]);
            this.submitting.set(false);
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'Error creando el casillero', 'Error');
            this.submitting.set(false);
          }
        })
      );
    }
  }

  cancelar(): void {
    if (this.isEditMode() && this.casilleroId) {
      this.router.navigate(['/casilleros', this.casilleroId]);
    } else {
      this.router.navigate(['/casilleros']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
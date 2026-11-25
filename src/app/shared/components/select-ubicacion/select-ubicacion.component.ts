import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import {
  Ubicacion,
  TipoUbicacion,
  formatearTipoUbicacion,
  construirRutaCorta
} from '../../../core/models/ubicacion.model';

interface GrupoUbicacion {
  tipo: TipoUbicacion;
  etiqueta: string;
  items: Ubicacion[];
}

@Component({
  selector: 'app-select-ubicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-ubicacion.component.html',
  styleUrls: ['./select-ubicacion.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectUbicacionComponent),
      multi: true
    }
  ]
})
export class SelectUbicacionComponent implements OnInit, OnDestroy, ControlValueAccessor {

  private ubicacionService = inject(UbicacionService);
  private toastr = inject(ToastrService);

  // ============ INPUTS ============
  @Input() mostrarInactivas = false;
  @Input() soloTipo: TipoUbicacion | null = null;
  @Input() excluirId: number | null = null;
  @Input() placeholder = 'Seleccione una ubicación...';
  @Input() requerido = false;
  @Input() mostrarRutaCompleta = true;
  @Input() emitirObjeto = false;

  // ============ OUTPUTS ============
  @Output() seleccionChange = new EventEmitter<Ubicacion | number | null>();

  // ============ ESTADO INTERNO ============
  ubicaciones: Ubicacion[] = [];
  grupos: GrupoUbicacion[] = [];
  cargando = false;
  disabled = false;

  // Valor actual (id o null)
  value: number | null = null;

  // ControlValueAccessor
  onChange: (value: number | null) => void = () => {};
  onTouched: () => void = () => {};

  private subscriptions = new Subscription();

  // ============ CICLO DE VIDA ============
  ngOnInit(): void {
    this.cargarUbicaciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ============ CARGA DE DATOS ============
  private cargarUbicaciones(): void {
    this.cargando = true;

    const peticion = this.mostrarInactivas
      ? this.ubicacionService.getAll()
      : this.ubicacionService.getActivas();

    this.subscriptions.add(
      peticion.subscribe({
        next: (data) => {
          let lista = data;

          // Filtrar por tipo si se especificó
          if (this.soloTipo) {
            lista = lista.filter(u => u.tipo === this.soloTipo);
          }

          // Excluir una ubicación específica (útil al editar)
          if (this.excluirId != null) {
            lista = lista.filter(u => u.id !== this.excluirId);
          }

          this.ubicaciones = lista;
          this.agrupar();
          this.cargando = false;
        },
        error: () => {
          this.toastr.error('Error cargando ubicaciones', 'Error');
          this.cargando = false;
        }
      })
    );
  }

  private agrupar(): void {
    const mapa = new Map<TipoUbicacion, Ubicacion[]>();

    for (const u of this.ubicaciones) {
      if (!mapa.has(u.tipo)) {
        mapa.set(u.tipo, []);
      }
      mapa.get(u.tipo)!.push(u);
    }

    // Ordenar los grupos en el orden del enum
    const orden: TipoUbicacion[] = [
      'PISO', 'OFICINA', 'CASILLERO', 'VEHICULO', 'COMPARTIMIENTO',
      'PATIO', 'GARAJE', 'PASILLO', 'DEPOSITO', 'OTRO'
    ];

    this.grupos = orden
      .filter(tipo => mapa.has(tipo))
      .map(tipo => ({
        tipo,
        etiqueta: this.etiquetaGrupo(tipo),
        items: mapa.get(tipo)!.sort((a, b) => a.nombre.localeCompare(b.nombre))
      }));
  }

  private etiquetaGrupo(tipo: TipoUbicacion): string {
    const etiquetas: Record<TipoUbicacion, string> = {
      PISO: 'Pisos',
      OFICINA: 'Oficinas',
      CASILLERO: 'Casilleros',
      VEHICULO: 'Vehículos',
      COMPARTIMIENTO: 'Compartimientos',
      PATIO: 'Patios',
      GARAJE: 'Garajes',
      PASILLO: 'Pasillos',
      DEPOSITO: 'Depósitos',
      OTRO: 'Otros'
    };
    return etiquetas[tipo];
  }

  // ============ EVENTO DEL SELECT ============
  onSelectChange(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    const id = valor ? Number(valor) : null;

    this.value = id;
    this.onChange(id);
    this.onTouched();

    if (this.emitirObjeto) {
      const seleccionada = id != null
        ? this.ubicaciones.find(u => u.id === id) ?? null
        : null;
      this.seleccionChange.emit(seleccionada);
    } else {
      this.seleccionChange.emit(id);
    }
  }

  // ============ HELPERS DE VISUALIZACIÓN ============
  getDisplay(u: Ubicacion): string {
    if (this.mostrarRutaCompleta && u.padreNombre) {
      return `${u.codigo} - ${construirRutaCorta(u)}`;
    }
    return `${u.codigo} - ${u.nombre}`;
  }

  // ============ ControlValueAccessor ============
  writeValue(value: number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
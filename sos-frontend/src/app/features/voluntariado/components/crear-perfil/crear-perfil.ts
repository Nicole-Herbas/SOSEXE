import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { PerfilVoluntario } from '../../models/perfil-voluntario';
import { PerfilVoluntarioService } from '../../services/perfil-voluntario.service';

interface Departamento {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-crear-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-perfil.html',
  styleUrl: './crear-perfil.scss'
})
export class CrearPerfilComponent implements OnInit {

  @Input() perfilExistente: PerfilVoluntario | null = null;
  @Input() nombreUsuario = '';
  @Input() emailUsuario = '';

  @Output() perfilCreado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  readonly textos = APP_TEXTOS.voluntariado.perfilVoluntario;

  readonly departamentos: Departamento[] = [
    { id: 1, nombre: 'Chuquisaca' },
    { id: 2, nombre: 'La Paz' },
    { id: 3, nombre: 'Cochabamba' },
    { id: 4, nombre: 'Oruro' },
    { id: 5, nombre: 'Potosí' },
    { id: 6, nombre: 'Tarija' },
    { id: 7, nombre: 'Santa Cruz' },
    { id: 8, nombre: 'Beni' },
    { id: 9, nombre: 'Pando' },
  ];

  pasoActual = 1;
  datosForm!: FormGroup;

  habilidadesSeleccionadas: string[] = [];
  disponibilidadSeleccionada: string[] = [];

  errorHabilidades = '';
  errorDisponibilidad = '';

  mensajeError = '';
  cargando = false;

  get esEdicion(): boolean {
    return this.perfilExistente !== null;
  }

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilVoluntarioService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.datosForm = this.fb.group({

      telefono: [
        this.perfilExistente?.telefono ?? '',
        [Validators.required]
      ],

      emailContacto: [
        this.perfilExistente?.emailContacto ?? this.emailUsuario,
        [Validators.required, Validators.email]
      ],

      departamentoId: [
        this.perfilExistente?.departamentoId ?? null,
        [Validators.required]
      ],

      ciudad: [
        this.perfilExistente?.ciudad ?? '',
        [Validators.required]
      ],

    });

    if (this.perfilExistente) {
      this.habilidadesSeleccionadas = [...this.perfilExistente.habilidades];
      this.disponibilidadSeleccionada = [...this.perfilExistente.disponibilidad];
    }
  }


  // ── Navegación del wizard ──────────────────────────────────────────────

  irAPaso(paso: number): void {

    if (paso === 2 && this.pasoActual === 1) {
      if (!this.validarPaso1()) return;
    }

    if (paso === 3 && this.pasoActual === 2) {
      if (!this.validarPaso2()) return;
    }

    this.pasoActual = paso;
  }


  siguientePaso(): void {
    this.irAPaso(this.pasoActual + 1);
  }


  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }


  // ── Validaciones ───────────────────────────────────────────────────────

  private validarPaso1(): boolean {
    this.datosForm.markAllAsTouched();
    return this.datosForm.valid;
  }


  private validarPaso2(): boolean {
    if (this.habilidadesSeleccionadas.length === 0) {
      this.errorHabilidades = this.textos.paso2.habilidadError;
      return false;
    }
    this.errorHabilidades = '';
    return true;
  }


  private validarPaso3(): boolean {
    if (this.disponibilidadSeleccionada.length === 0) {
      this.errorDisponibilidad = this.textos.paso3.disponibilidadError;
      return false;
    }
    this.errorDisponibilidad = '';
    return true;
  }


  // ── Toggle chips ───────────────────────────────────────────────────────

  toggleHabilidad(habilidad: string): void {

    const idx = this.habilidadesSeleccionadas.indexOf(habilidad);

    if (idx >= 0) {
      this.habilidadesSeleccionadas.splice(idx, 1);
    } else {
      this.habilidadesSeleccionadas.push(habilidad);
    }

    if (this.habilidadesSeleccionadas.length > 0) {
      this.errorHabilidades = '';
    }
  }


  toggleDisponibilidad(opcion: string): void {

    const idx = this.disponibilidadSeleccionada.indexOf(opcion);

    if (idx >= 0) {
      this.disponibilidadSeleccionada.splice(idx, 1);
    } else {
      this.disponibilidadSeleccionada.push(opcion);
    }

    if (this.disponibilidadSeleccionada.length > 0) {
      this.errorDisponibilidad = '';
    }
  }


  esHabilidadSeleccionada(habilidad: string): boolean {
    return this.habilidadesSeleccionadas.includes(habilidad);
  }


  esDisponibilidadSeleccionada(opcion: string): boolean {
    return this.disponibilidadSeleccionada.includes(opcion);
  }


  // ── Envío del formulario ───────────────────────────────────────────────

  onSubmit(): void {

    if (!this.validarPaso3()) return;

    this.cargando = true;
    this.mensajeError = '';

    const perfil: PerfilVoluntario = {
      telefono: this.datosForm.value.telefono,
      emailContacto: this.datosForm.value.emailContacto,
      departamentoId: Number(this.datosForm.value.departamentoId),
      ciudad: this.datosForm.value.ciudad,
      habilidades: [...this.habilidadesSeleccionadas],
      disponibilidad: [...this.disponibilidadSeleccionada],
    };


    if (this.esEdicion) {

      this.perfilService
        .actualizar(perfil)
        .subscribe({

          next: () => {
            this.cargando = false;
            this.cdr.markForCheck();
            this.perfilCreado.emit();
          },

          error: () => {
            this.cargando = false;
            this.mensajeError = this.textos.errorActualizar;
            this.cdr.markForCheck();
          },

        });

    } else {

      this.perfilService
        .crear(perfil)
        .subscribe({

          next: () => {
            this.cargando = false;
            this.cdr.markForCheck();
            this.perfilCreado.emit();
          },

          error: () => {
            this.cargando = false;
            this.mensajeError = this.textos.errorCrear;
            this.cdr.markForCheck();
          },

        });

    }
  }
}

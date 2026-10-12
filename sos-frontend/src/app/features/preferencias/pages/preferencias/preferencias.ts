import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { SuscripcionSmsService } from '../../services/suscripcion-sms.service';
import { SuscripcionSms } from '../../models/suscripcion-sms.model';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { ApiResponse } from '../../../../shared/models/api-response';

interface Departamento {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-preferencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preferencias.html',
  styleUrl: './preferencias.scss'
})
export class PreferenciasComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly suscripcionService = inject(SuscripcionSmsService);

  readonly textos = APP_TEXTOS.preferencias;
  departamentos: Departamento[] = [];
  formulario!: FormGroup;

  cargando = signal<boolean>(true);
  cargandoDepartamentos = signal<boolean>(true);
  errorDepartamentos = signal<string | null>(null);
  guardando = signal<boolean>(false);
  cancelando = signal<boolean>(false);
  confirmandoCancelacion = signal<boolean>(false);

  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);
  suscripcionActual = signal<SuscripcionSms | null>(null);

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDepartamentos();
    this.cargarSuscripcion();
  }

  private inicializarFormulario(): void {
    this.formulario = this.fb.group({
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+?[0-9]{7,15}$/)
        ]
      ],
      departamentoId: [{ value: null, disabled: true }, [Validators.required]],
      consentimiento: [false, [Validators.requiredTrue]]
    });
  }

  private cargarDepartamentos(): void {
    this.http.get<ApiResponse<Departamento[]>>('/api/departamentos').subscribe({
      next: (respuesta) => {
        this.departamentos = respuesta.data ?? [];
        this.cargandoDepartamentos.set(false);

        if (this.departamentos.length === 0) {
          this.errorDepartamentos.set(this.textos.errorCargaDepartamentos);
          return;
        }

        this.formulario.get('departamentoId')?.enable();
      },
      error: (error: unknown) => {
        console.error('Error al cargar departamentos:', error);
        this.cargandoDepartamentos.set(false);
        this.errorDepartamentos.set(this.textos.errorCargaDepartamentos);
      }
    });
  }

  private cargarSuscripcion(): void {
    this.cargando.set(true);
    this.suscripcionService.obtenerSuscripcion().subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res?.data) {
          this.suscripcionActual.set(res.data);
          this.formulario.patchValue({
            telefono: res.data.telefono,
            departamentoId: res.data.departamentoId,
            consentimiento: false
          });
        }
      },
      error: (error) => {
        this.cargando.set(false);
        if (error.status !== 404) {
          this.mensajeError.set(error?.error?.mensaje || this.textos.errorGenerico);
        }
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid || this.departamentos.length === 0) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    const valor = this.formulario.value;
    const datos: SuscripcionSms = {
      telefono: valor.telefono.trim(),
      departamentoId: Number(valor.departamentoId)
    };

    this.suscripcionService.suscribir(datos).subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.mensajeExito.set(this.textos.confirmacion);
        if (res?.data) {
          this.suscripcionActual.set(res.data);
        }
      },
      error: (error) => {
        this.guardando.set(false);
        this.mensajeError.set(error?.error?.mensaje || this.textos.errorGenerico);
      }
    });
  }

  solicitarCancelacion(): void {
    this.confirmandoCancelacion.set(true);
    this.mensajeError.set(null);
  }

  descartarCancelacion(): void {
    this.confirmandoCancelacion.set(false);
  }

  confirmarCancelacion(): void {
    this.cancelando.set(true);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    this.suscripcionService.cancelar().subscribe({
      next: () => {
        this.cancelando.set(false);
        this.confirmandoCancelacion.set(false);
        this.mensajeExito.set(this.textos.confirmacionCancelacion);
        this.suscripcionActual.update(actual =>
          actual ? { ...actual, activa: false } : null
        );
        this.formulario.patchValue({ consentimiento: false });
      },
      error: (error) => {
        this.cancelando.set(false);
        this.mensajeError.set(error?.error?.mensaje || this.textos.errorGenerico);
      }
    });
  }

  get tieneSuscripcionActiva(): boolean {
    return !!this.suscripcionActual()?.activa;
  }

  get telefonoInvalido(): boolean {
    const control = this.formulario.get('telefono');
    return !!(control && control.touched && control.invalid);
  }

  get departamentoInvalido(): boolean {
    const control = this.formulario.get('departamentoId');
    return !!(control && control.touched && control.invalid);
  }

  get consentimientoInvalido(): boolean {
    const control = this.formulario.get('consentimiento');
    return !!(control && control.touched && control.invalid);
  }
}

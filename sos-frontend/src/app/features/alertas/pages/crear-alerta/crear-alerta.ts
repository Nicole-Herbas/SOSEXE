import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { Departamento, Severidad } from '../../models/alerta.model';
import { AlertaService } from '../../services/alerta.service';

const textoObligatorio: ValidatorFn = (control: AbstractControl) =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };

const vigenciaValida: ValidatorFn = (control: AbstractControl) => {
  const inicio = control.get('fechaPublicacion')?.value;
  const fin = control.get('fechaExpiracion')?.value;
  if (!inicio || !fin) return null;
  return Date.parse(fin) > Date.parse(inicio) ? null : { vigencia: true };
};

@Component({
  selector: 'app-crear-alerta',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './crear-alerta.html',
  styleUrl: './crear-alerta.scss',
})
export class CrearAlertaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(AlertaService);
  private readonly destroyRef = inject(DestroyRef);
  readonly textos = APP_TEXTOS.alertas;
  readonly severidades: Severidad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
  readonly camposTexto = [
    { nombre: 'titulo', label: this.textos.titulo, max: 220 },
    { nombre: 'mensaje', label: this.textos.mensaje, max: 1000 },
    { nombre: 'fuente', label: this.textos.fuente, max: 250 },
  ] as const;
  readonly formulario = this.fb.nonNullable.group(
    {
      titulo: ['', [textoObligatorio, Validators.maxLength(220)]],
      departamentoId: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(1),
      ]),
      severidad: this.fb.control<Severidad | null>(null, [
        Validators.required,
        Validators.pattern(/^(BAJA|MEDIA|ALTA|CRITICA)$/),
      ]),
      mensaje: ['', [textoObligatorio, Validators.maxLength(1000)]],
      fuente: ['', [textoObligatorio, Validators.maxLength(250)]],
      fechaPublicacion: ['', Validators.required],
      fechaExpiracion: ['', Validators.required],
    },
    { validators: vigenciaValida },
  );
  readonly departamentos = signal<Departamento[]>([]);
  readonly cargando = signal(true);
  readonly errorDepartamentos = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);
  readonly erroresServidor = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.servicio
      .departamentos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.cargando.set(false);
          if (!respuesta.success || !respuesta.data?.length) {
            this.errorDepartamentos.set(this.textos.errorDepartamentos);
            return;
          }
          this.departamentos.set(respuesta.data);
        },
        error: () => {
          this.cargando.set(false);
          this.errorDepartamentos.set(this.textos.errorDepartamentos);
        },
      });
  }

  guardar(): void {
    if (this.guardando()) return;
    this.mensajeExito.set(null);
    this.mensajeError.set(null);
    this.erroresServidor.set({});
    this.formulario.markAllAsTouched();
    const valor = this.formulario.getRawValue();
    if (
      this.formulario.invalid ||
      valor.departamentoId === null ||
      valor.severidad === null ||
      !this.departamentos().some((departamento) => departamento.id === valor.departamentoId)
    )
      return;

    this.guardando.set(true);
    this.servicio
      .crear({
        ...valor,
        departamentoId: valor.departamentoId,
        severidad: valor.severidad,
        titulo: valor.titulo.trim(),
        mensaje: valor.mensaje.trim(),
        fuente: valor.fuente.trim(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (respuesta) => {
          if (!respuesta.success || !respuesta.data?.id) {
            this.mensajeError.set(this.textos.errorGuardar);
            return;
          }
          this.formulario.reset();
          this.mensajeExito.set(this.textos.exito);
        },
        error: (error: HttpErrorResponse) => {
          const cuerpo: unknown = error.error;
          if (cuerpo && typeof cuerpo === 'object') {
            if ('message' in cuerpo && typeof cuerpo.message === 'string') {
              this.mensajeError.set(cuerpo.message);
            }
            if ('data' in cuerpo && cuerpo.data && typeof cuerpo.data === 'object') {
              this.erroresServidor.set(
                Object.fromEntries(
                  Object.entries(cuerpo.data).filter(
                    (entrada): entrada is [string, string] => typeof entrada[1] === 'string',
                  ),
                ),
              );
            }
          }
          if (!this.mensajeError()) this.mensajeError.set(this.textos.errorGuardar);
        },
      });
  }

  errorCampo(nombre: string): string | null {
    const servidor = this.erroresServidor()[nombre];
    if (servidor) return servidor;
    const control = this.formulario.get(nombre);
    if (!control?.touched || !control.invalid) return null;
    return control.hasError('maxlength') ? this.textos.errorLongitud : this.textos.errorObligatorio;
  }

  get errorVigencia(): string | null {
    return (
      this.erroresServidor()['vigenciaValida'] ??
      (this.formulario.touched && this.formulario.hasError('vigencia')
        ? this.textos.errorVigencia
        : null)
    );
  }
}

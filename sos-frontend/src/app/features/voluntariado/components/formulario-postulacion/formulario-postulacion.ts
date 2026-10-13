import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, Input, OnChanges, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { GESTIONAR_SESION_EN_COMPONENTE } from '../../../auth/interceptors/auth.interceptor';
import { AuthService } from '../../../auth/services/auth.service';
import { OportunidadVoluntariado } from '../../models/oportunidad-voluntariado';
import { PerfilVoluntario } from '../../models/perfil-voluntario';
import { PerfilVoluntarioService } from '../../services/perfil-voluntario.service';
import { PostulacionService } from '../../services/postulacion.service';

type EstadoFormulario = 'SIN_SESION' | 'CARGANDO' | 'SIN_PERFIL' | 'LISTO'
  | 'DUPLICADA' | 'EXITO' | 'ERROR_CARGA' | 'NO_DISPONIBLE';

@Component({
  selector: 'app-formulario-postulacion',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formulario-postulacion.html',
  styleUrl: './formulario-postulacion.scss',
})
export class FormularioPostulacion implements OnChanges {
  @Input({ required: true }) oportunidad!: OportunidadVoluntariado;

  readonly textos = APP_TEXTOS.voluntariado.oportunidades.postulacion;
  readonly estado = signal<EstadoFormulario>('CARGANDO');
  readonly perfil = signal<PerfilVoluntario | null>(null);
  readonly enviando = signal(false);
  readonly mensajeError = signal('');
  readonly sugerencia = computed(() => (this.perfil()?.disponibilidad ?? []).join(', '));
  readonly formulario = new FormGroup({
    disponibilidad: new FormControl('', {
      nonNullable: true,
      validators: [control => control.value?.trim() ? null : { required: true }, Validators.maxLength(255)],
    }),
    comentario: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
  });

  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilVoluntarioService);
  private readonly postulacionService = inject(PostulacionService);
  private readonly destroyRef = inject(DestroyRef);
  private consulta?: Subscription;
  private envio?: Subscription;

  get returnUrl(): string {
    return `/voluntariado/${this.oportunidad.id}`;
  }

  ngOnChanges(): void {
    this.envio?.unsubscribe();
    this.enviando.set(false);
    this.formulario.enable();
    this.formulario.reset();
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.consulta?.unsubscribe();
    this.perfil.set(null);
    this.mensajeError.set('');
    if (!this.authService.estaAutenticado()) {
      this.estado.set('SIN_SESION');
      return;
    }
    this.estado.set('CARGANDO');
    let consultandoPerfil = true;
    const context = new HttpContext().set(GESTIONAR_SESION_EN_COMPONENTE, true);
    this.consulta = this.perfilService.obtenerMiPerfil(context).pipe(
      switchMap(respuesta => {
        this.perfil.set(respuesta.data);
        consultandoPerfil = false;
        return this.postulacionService.listarMias();
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: respuesta => this.estado.set(respuesta.data.some(
        postulacion => postulacion.voluntariadoId === this.oportunidad.id,
      ) ? 'DUPLICADA' : 'LISTO'),
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) this.sesionVencida();
        else if (error.status === 403 || (consultandoPerfil && error.status === 404)) {
          this.estado.set('SIN_PERFIL');
        } else {
          this.estado.set('ERROR_CARGA');
          this.mensajeError.set(this.textos.errorCarga);
        }
      },
    });
  }

  puedeUsarSugerencia(): boolean {
    return !!this.sugerencia().trim() && this.sugerencia().length <= 255
      && this.formulario.controls.disponibilidad.value === '' && !this.enviando();
  }

  usarSugerencia(): void {
    if (this.puedeUsarSugerencia()) {
      this.formulario.controls.disponibilidad.setValue(this.sugerencia());
    }
  }

  enviar(): void {
    if (this.enviando() || this.estado() !== 'LISTO') return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    this.mensajeError.set('');
    const valores = this.formulario.getRawValue();
    this.enviando.set(true);
    this.formulario.disable();
    this.envio = this.postulacionService.crear({
      voluntariadoId: this.oportunidad.id,
      disponibilidad: valores.disponibilidad,
      comentario: valores.comentario,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.enviando.set(false);
        this.estado.set('EXITO');
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        this.formulario.enable();
        switch (error.status) {
          case 401: this.sesionVencida(); break;
          case 403: this.estado.set('SIN_PERFIL'); break;
          case 409: this.estado.set('DUPLICADA'); break;
          case 400:
          case 404:
            this.estado.set('NO_DISPONIBLE');
            this.mensajeError.set(error.status === 404 ? this.textos.noEncontrada : this.textos.noDisponible);
            break;
          case 422: this.mensajeError.set(this.textos.validacionServidor); break;
          case 200:
          case 201:
            this.estado.set('ERROR_CARGA');
            this.mensajeError.set(this.textos.respuestaInesperada);
            break;
          default: this.mensajeError.set(this.textos.errorConexion);
        }
      },
    });
  }

  private sesionVencida(): void {
    this.estado.set('SIN_SESION');
    this.mensajeError.set(this.textos.sesionVencida);
  }
}

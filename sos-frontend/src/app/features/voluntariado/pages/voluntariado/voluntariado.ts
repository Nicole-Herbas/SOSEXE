import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  FeatureToggles,
  FEATURE_TOGGLES,
} from '../../../../shared/config/feature-toggles';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

import { AuthService } from '../../../auth/services/auth.service';
import { PerfilVoluntarioService } from '../../services/perfil-voluntario.service';
import { PerfilVoluntario } from '../../models/perfil-voluntario';

import { CrearPerfilComponent } from '../../components/crear-perfil/crear-perfil';
import { TarjetaPerfilComponent } from '../../components/tarjeta-perfil/tarjeta-perfil';


export type EstadoPagina =
  | 'CARGANDO'
  | 'SIN_SESION'
  | 'SIN_PERFIL'
  | 'CREANDO_PERFIL'
  | 'EDITANDO_PERFIL'
  | 'CON_PERFIL';


@Component({
  imports: [
    CommonModule,
    RouterLink,
    CrearPerfilComponent,
    TarjetaPerfilComponent,
  ],
  selector: 'app-voluntariado',
  styleUrl: './voluntariado.scss',
  templateUrl: './voluntariado.html',
})
export class Voluntariado implements OnInit {

  readonly textos = APP_TEXTOS.voluntariado;

  readonly featureToggles: Pick<FeatureToggles, 'voluntariado'> = {
    voluntariado: { ...FEATURE_TOGGLES.voluntariado },
  };

  readonly estado = signal<EstadoPagina>('CARGANDO');
  readonly perfil = signal<PerfilVoluntario | null>(null);
  readonly nombreUsuario = signal<string>('');
  readonly emailUsuario = signal<string>('');
  readonly mensajeExito = signal<string>('');


  constructor(
    private authService: AuthService,
    private perfilService: PerfilVoluntarioService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    if (!this.authService.estaAutenticado()) {
      this.estado.set('SIN_SESION');
      return;
    }

    this.nombreUsuario.set(
      this.authService.obtenerNombreUsuario()
    );

    this.emailUsuario.set(
      localStorage.getItem('usuario_email') ?? ''
    );

    this.verificarPerfil();
  }


  private verificarPerfil(): void {

    this.estado.set('CARGANDO');

    this.perfilService
      .existeMiPerfil()
      .subscribe({

        next: (resp) => {

          if (resp.data) {
            this.cargarPerfil();
          } else {
            this.estado.set('SIN_PERFIL');
            this.cdr.markForCheck();
          }

        },

        error: () => {
          this.estado.set('SIN_PERFIL');
          this.cdr.markForCheck();
        },

      });
  }


  private cargarPerfil(): void {

    this.perfilService
      .obtenerMiPerfil()
      .subscribe({

        next: (resp) => {
          this.perfil.set(resp.data);
          this.estado.set('CON_PERFIL');
          this.cdr.markForCheck();
        },

        error: () => {
          this.estado.set('SIN_PERFIL');
          this.cdr.markForCheck();
        },

      });
  }


  iniciarCreacion(): void {
    this.mensajeExito.set('');
    this.estado.set('CREANDO_PERFIL');
  }


  iniciarEdicion(): void {
    this.mensajeExito.set('');
    this.estado.set('EDITANDO_PERFIL');
  }


  onPerfilCreado(): void {
    this.mensajeExito.set('');
    this.cargarPerfilYMostrarExito();
  }


  onCancelar(): void {

    if (this.perfil()) {
      this.estado.set('CON_PERFIL');
    } else {
      this.estado.set('SIN_PERFIL');
    }

  }


  private cargarPerfilYMostrarExito(): void {

    this.perfilService
      .obtenerMiPerfil()
      .subscribe({

        next: (resp) => {

          this.perfil.set(resp.data);
          this.estado.set('CON_PERFIL');

          const textoExito = this.estado() === 'CON_PERFIL'
            ? this.textos.perfilVoluntario.exitoTitulo
              + this.nombreUsuario() + '!'
            : '';

          this.mensajeExito.set(textoExito);
          this.cdr.markForCheck();

        },

        error: () => {
          this.estado.set('SIN_PERFIL');
          this.cdr.markForCheck();
        },

      });
  }
}
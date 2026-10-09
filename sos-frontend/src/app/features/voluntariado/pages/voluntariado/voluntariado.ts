import { Component, OnInit } from '@angular/core';
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


type EstadoPagina =
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

  estado: EstadoPagina = 'CARGANDO';
  perfil: PerfilVoluntario | null = null;
  nombreUsuario = '';
  emailUsuario = '';
  mensajeExito = '';


  constructor(
    private authService: AuthService,
    private perfilService: PerfilVoluntarioService
  ) {}


  ngOnInit(): void {

    if (!this.authService.estaAutenticado()) {
      this.estado = 'SIN_SESION';
      return;
    }

    this.nombreUsuario =
      this.authService.obtenerNombreUsuario();

    this.emailUsuario =
      localStorage.getItem('usuario_email') ?? '';

    this.verificarPerfil();
  }


  private verificarPerfil(): void {

    this.estado = 'CARGANDO';

    this.perfilService
      .existeMiPerfil()
      .subscribe({

        next: (resp) => {

          if (resp.data) {
            this.cargarPerfil();
          } else {
            this.estado = 'SIN_PERFIL';
          }

        },

        error: () => {
          this.estado = 'SIN_PERFIL';
        },

      });
  }


  private cargarPerfil(): void {

    this.perfilService
      .obtenerMiPerfil()
      .subscribe({

        next: (resp) => {
          this.perfil = resp.data;
          this.estado = 'CON_PERFIL';
        },

        error: () => {
          this.estado = 'SIN_PERFIL';
        },

      });
  }


  iniciarCreacion(): void {
    this.mensajeExito = '';
    this.estado = 'CREANDO_PERFIL';
  }


  iniciarEdicion(): void {
    this.mensajeExito = '';
    this.estado = 'EDITANDO_PERFIL';
  }


  onPerfilCreado(): void {
    this.mensajeExito = '';
    this.cargarPerfilYMostrarExito();
  }


  onCancelar(): void {

    if (this.perfil) {
      this.estado = 'CON_PERFIL';
    } else {
      this.estado = 'SIN_PERFIL';
    }

  }


  private cargarPerfilYMostrarExito(): void {

    this.perfilService
      .obtenerMiPerfil()
      .subscribe({

        next: (resp) => {

          this.perfil = resp.data;
          this.estado = 'CON_PERFIL';

          this.mensajeExito = this.estado === 'CON_PERFIL'
            ? this.textos.perfilVoluntario.exitoTitulo
              + this.nombreUsuario + '!'
            : '';

        },

        error: () => {
          this.estado = 'SIN_PERFIL';
        },

      });
  }
}
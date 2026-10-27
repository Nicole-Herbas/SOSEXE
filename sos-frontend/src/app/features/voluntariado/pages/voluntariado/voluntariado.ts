import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  FeatureToggles,
  FEATURE_TOGGLES,
} from '../../../../shared/config/feature-toggles';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

import { AuthService } from '../../../auth/services/auth.service';
import { PerfilVoluntarioService } from '../../services/perfil-voluntario.service';
import { PerfilVoluntario } from '../../models/perfil-voluntario';
import { OportunidadVoluntariado } from '../../models/oportunidad-voluntariado';
import { VoluntariadoService } from '../../services/voluntariado.service';

import { CrearPerfilComponent } from '../../components/crear-perfil/crear-perfil';
import { TarjetaPerfilComponent } from '../../components/tarjeta-perfil/tarjeta-perfil';


export type EstadoPagina =
  | 'CARGANDO'
  | 'SIN_SESION'
  | 'SIN_PERFIL'
  | 'CREANDO_PERFIL'
  | 'EDITANDO_PERFIL'
  | 'CON_PERFIL';


import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CrearPerfilComponent,
    TarjetaPerfilComponent,
    TranslatePipe,
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

  readonly oportunidades = signal<OportunidadVoluntariado[]>([]);
  readonly cargandoOportunidades = signal(false);
  readonly errorOportunidades = signal(false);

  readonly ciudadSeleccionada = signal('');
  readonly tipoAyudaSeleccionado = signal<number | null>(null);

  readonly ciudadesDisponibles = computed(() => {
    const ciudades = new Map<string, string>();
    for (const oportunidad of this.oportunidades()) {
      const nombre = this.limpiarEspacios(oportunidad.centroCiudad);
      const valor = this.normalizarCiudad(nombre);
      if (valor && !ciudades.has(valor)) {
        ciudades.set(valor, nombre);
      }
    }
    return Array.from(ciudades, ([valor, nombre]) => ({ valor, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  });

  readonly tiposAyudaDisponibles = computed(() => {
    const tipos = new Map<number, string>();
    for (const oportunidad of this.oportunidades()) {
      for (const necesidad of oportunidad.centroNecesidades ?? []) {
        const nombre = this.limpiarEspacios(necesidad?.nombre);
        if (necesidad?.id != null && nombre && !tipos.has(necesidad.id)) {
          tipos.set(necesidad.id, nombre);
        }
      }
    }
    return Array.from(tipos, ([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  });

  readonly oportunidadesFiltradas = computed(() => {
    const ciudad = this.normalizarCiudad(this.ciudadSeleccionada());
    const tipoAyuda = this.tipoAyudaSeleccionado();
    return this.oportunidades().filter((oportunidad) =>
      (!ciudad || this.normalizarCiudad(oportunidad.centroCiudad) === ciudad)
      && (tipoAyuda === null || (oportunidad.centroNecesidades ?? [])
        .some((necesidad) => necesidad?.id === tipoAyuda)),
    );
  });

  private readonly formatoFecha = new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });


  constructor(
    private authService: AuthService,
    private perfilService: PerfilVoluntarioService,
    private voluntariadoService: VoluntariadoService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    if (this.featureToggles.voluntariado.mostrarSeccionOportunidades) {
      this.cargarOportunidades();
    }

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


  private cargarOportunidades(): void {
    this.cargandoOportunidades.set(true);
    this.errorOportunidades.set(false);

    this.voluntariadoService.listarTodos().subscribe({
      next: (respuesta) => {
        this.oportunidades.set(respuesta.data);
        this.cargandoOportunidades.set(false);
      },
      error: () => {
        this.errorOportunidades.set(true);
        this.cargandoOportunidades.set(false);
      },
    });
  }

  restablecerFiltros(): void {
    this.ciudadSeleccionada.set('');
    this.tipoAyudaSeleccionado.set(null);
  }

  private limpiarEspacios(texto: string | null | undefined): string {
    return (texto ?? '').trim().replace(/\s+/g, ' ');
  }

  private normalizarCiudad(ciudad: string | null): string {
    return this.limpiarEspacios(ciudad)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es');
  }

  formatearUbicacion(oportunidad: OportunidadVoluntariado): string {
    return [oportunidad.centroCiudad, oportunidad.centroDepartamento]
      .filter(Boolean)
      .join(', ') || this.textos.oportunidades.ubicacionNoDisponible;
  }

  formatearFecha(fecha: string): string {
    const fechaParseada = new Date(fecha);
    return Number.isNaN(fechaParseada.getTime())
      ? this.textos.oportunidades.fechaNoDisponible
      : this.formatoFecha.format(fechaParseada);
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

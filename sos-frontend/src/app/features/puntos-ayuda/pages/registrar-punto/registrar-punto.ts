import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

import {
  ItemCatalogo,
  PuntoAyudaPropio,
  RegistroPuntoSolicitud,
  TipoPuntoCiudadano,
  UbicacionSeleccionada
} from '../../models/registrar-punto.model';

import { ESTADO_VERIFICACION_PUNTO } from '../../models/estado-punto.constants';
import { RegistrarPuntoService } from '../../services/registrar-punto.service';
import { MapaRegistroComponent } from '../../components/mapa-registro/mapa-registro';


@Component({
  selector: 'app-registrar-punto',
  imports: [
    FormsModule,
    RouterLink,
    MapaRegistroComponent
  ],
  templateUrl: './registrar-punto.html',
  styleUrl: './registrar-punto.scss'
})
export class RegistrarPuntoComponent implements OnInit {

  // ==========================================
  // SERVICIOS Y CONSTANTES
  // ==========================================

  private readonly registroService = inject(RegistrarPuntoService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly textos = APP_TEXTOS.registrarPunto;
  readonly tipos = APP_TEXTOS.registrarPunto.tipos;
  readonly estados = ESTADO_VERIFICACION_PUNTO;
  readonly tipoDonacion = 'PUNTO_DONACION' as const;
  readonly tipoEmergencia = 'EMERGENCIA' as const;
  readonly clasesEmergencia = APP_TEXTOS.registrarPunto.clasesEmergencia;


  // ==========================================
  // ESTADO GENERAL
  // ==========================================

  vista: 'formulario' | 'confirmacion' | 'mios' = 'formulario';

  departamentos: ItemCatalogo[] = [];
  necesidades: ItemCatalogo[] = [];
  necesidadIds: number[] = [];
  donacionesAceptadasIds: number[] = [];

  cargandoCatalogos = true;
  enviando = false;
  error = '';
  errorUbicacion = '';
  registroCreado: PuntoAyudaPropio | null = null;

  misPuntos: PuntoAyudaPropio[] = [];
  puntoSeleccionado: PuntoAyudaPropio | null = null;
  cargandoMisPuntos = false;
  errorMisPuntos = '';


  // ==========================================
  // DATOS DEL FORMULARIO
  // ==========================================

  modelo = this.nuevoModelo();

  private nuevoModelo() {
    return {
      nombre: '',
      tipo: '' as TipoPuntoCiudadano | '',
      descripcion: '',
      direccion: '',
      ciudad: '',
      departamentoId: 0,
      latitud: null as number | null,
      longitud: null as number | null,
      nombreContacto: '',
      telefonoContacto: '',
      correoContacto: '',
      informacionAdicional: '',
      horarioAtencion: '',
      claseEmergencia: '',
      fechaEmergencia: ''
    };
  }


  // ==========================================
  // CATÁLOGOS
  // ==========================================

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {

    this.cargandoCatalogos = true;
    this.error = '';

    this.registroService
      .cargarCatalogos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (respuesta) => {
          this.departamentos = respuesta.departamentos;
          this.necesidades = respuesta.necesidades;
          this.cargandoCatalogos = false;

          if (this.departamentos.length === 0) {
            this.error = this.textos.errores.departamentos;
          } else if (this.necesidades.length === 0) {
            this.error = this.textos.errores.necesidades;
          }

          this.cdr.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar catálogos:', error);
          this.cargandoCatalogos = false;
          this.error = this.textos.errores.catalogos;
          this.cdr.markForCheck();
        }
      });
  }


  // ==========================================
  // UBICACIÓN
  // ==========================================

  seleccionarUbicacion(ubicacion: UbicacionSeleccionada): void {
    this.modelo.latitud = ubicacion.latitud;
    this.modelo.longitud = ubicacion.longitud;
    this.errorUbicacion = '';
    this.cdr.markForCheck();
  }

  indicarErrorUbicacion(codigo: 'NO_DISPONIBLE' | 'PERMISO_DENEGADO'): void {
    this.errorUbicacion = codigo === 'NO_DISPONIBLE'
      ? this.textos.errores.geolocalizacionNoDisponible
      : this.textos.errores.geolocalizacionDenegada;
    this.cdr.markForCheck();
  }


  // ==========================================
  // NECESIDADES
  // ==========================================

  alternarNecesidad(id: number, seleccionada: boolean): void {

    if (!this.necesidades.some(necesidad => necesidad.id === id)) {
      return;
    }

    if (seleccionada && !this.necesidadIds.includes(id)) {
      this.necesidadIds = [...this.necesidadIds, id];
    } else if (!seleccionada) {
      this.necesidadIds = this.necesidadIds.filter(valor => valor !== id);
    }
  }


  alternarDonacionAceptada(id: number, seleccionada: boolean): void {
    if (!this.necesidades.some(necesidad => necesidad.id === id)) return;
    if (seleccionada && !this.donacionesAceptadasIds.includes(id)) {
      this.donacionesAceptadasIds = [...this.donacionesAceptadasIds, id];
    } else if (!seleccionada) {
      this.donacionesAceptadasIds = this.donacionesAceptadasIds.filter(valor => valor !== id);
    }
  }

  // ==========================================
  // VALIDACIÓN
  // ==========================================

  get formularioValido(): boolean {

    const datos = this.modelo;
    const descripcion = this.construirDescripcion();

    return (
      !this.cargandoCatalogos &&
      !this.enviando &&
      this.departamentos.some(item => item.id === datos.departamentoId) &&
      this.tipos.some(item => item.valor === datos.tipo) &&
      datos.nombre.trim().length > 0 &&
      datos.nombre.trim().length <= 150 &&
      datos.descripcion.trim().length > 0 &&
      descripcion.length <= 500 &&
      (datos.tipo === this.tipoDonacion
        ? datos.horarioAtencion.trim().length > 0 &&
          datos.horarioAtencion.trim().length <= 100 &&
          this.donacionesAceptadasIds.length > 0 &&
          this.donacionesAceptadasIds.every(id => this.necesidades.some(item => item.id === id))
        : datos.tipo === this.tipoEmergencia &&
          this.clasesEmergencia.some(item => item.valor === datos.claseEmergencia) &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(datos.fechaEmergencia) &&
          !Number.isNaN(new Date(datos.fechaEmergencia).getTime())) &&
      datos.direccion.trim().length > 0 &&
      datos.direccion.trim().length <= 250 &&
      datos.ciudad.trim().length > 0 &&
      datos.ciudad.trim().length <= 100 &&
      datos.latitud !== null &&
      datos.latitud >= -90 && datos.latitud <= 90 &&
      datos.longitud !== null &&
      datos.longitud >= -180 && datos.longitud <= 180 &&
      datos.nombreContacto.trim().length > 0 &&
      datos.nombreContacto.trim().length <= 150 &&
      /^\+?[0-9]{7,15}$/.test(datos.telefonoContacto.trim()) &&
      datos.correoContacto.trim().length <= 150 &&
      (!datos.correoContacto.trim() ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correoContacto.trim())) &&
      this.necesidadIds.length > 0 &&
      this.necesidadIds.every(id => this.necesidades.some(item => item.id === id))
    );
  }


  // Datos complementarios se almacenan en la descripción EXISTENTE para no modificar MySQL.
  // Cuando se agreguen columnas propias en otra historia, se podrán migrar por separado.
  private construirDescripcion(): string {
    const datos = this.modelo;
    const partes = [datos.descripcion.trim()];
    if (datos.tipo === this.tipoDonacion) {
      const aceptadas = this.necesidades
        .filter(item => this.donacionesAceptadasIds.includes(item.id))
        .map(item => item.nombre).join(', ');
      partes.push(`${this.textos.campos.prefijoHorario}: ${datos.horarioAtencion.trim()}`);
      partes.push(`${this.textos.campos.prefijoDonacionesAceptadas}: ${aceptadas}`);
    } else if (datos.tipo === this.tipoEmergencia) {
      const clase = this.clasesEmergencia.find(item => item.valor === datos.claseEmergencia)?.nombre
        ?? datos.claseEmergencia;
      partes.push(`${this.textos.campos.prefijoTipoEmergencia}: ${clase}`);
      partes.push(`${this.textos.campos.prefijoFechaEmergencia}: ${datos.fechaEmergencia.replace('T', ' ')}`);
      partes.push(`${this.textos.campos.prefijoEstadoEmergencia}: ${this.textos.campos.estadoEmergenciaInicial}`);
    }
    if (datos.informacionAdicional.trim()) {
      partes.push(`${this.textos.campos.prefijoInformacionAdicional}: ${datos.informacionAdicional.trim()}`);
    }
    return partes.join('\n');
  }

  get caracteresDescripcion(): number {
    return this.construirDescripcion().length;
  }



  private construirSolicitud(): RegistroPuntoSolicitud {

    const datos = this.modelo;

    return {
      nombre: datos.nombre.trim(),
      tipo: datos.tipo as TipoPuntoCiudadano,
      descripcion: this.construirDescripcion(),
      direccion: datos.direccion.trim(),
      ciudad: datos.ciudad.trim(),
      departamentoId: datos.departamentoId,
      latitud: datos.latitud!,
      longitud: datos.longitud!,
      necesidadIds: [...this.necesidadIds],
      nombreContacto: datos.nombreContacto.trim(),
      telefonoContacto: datos.telefonoContacto.trim(),
      correoContacto: datos.correoContacto.trim() || null
    };
  }


  // ==========================================
  // REGISTRO
  // ==========================================

  registrar(): void {

    if (!this.formularioValido) {
      this.error = this.textos.errores.formulario;
      return;
    }

    this.enviando = true;
    this.error = '';

    this.registroService
      .registrar(this.construirSolicitud())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (punto) => {
          this.enviando = false;
          this.registroCreado = punto;
          this.vista = 'confirmacion';
          this.cdr.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.enviando = false;

          if (error.status === 401) {
            this.irAlLogin();
            return;
          }

          this.error = error.status === 400 || error.status === 422
            ? this.textos.errores.datos
            : this.textos.errores.registro;

          this.cdr.markForCheck();
        }
      });
  }


  // ==========================================
  // MIS PUNTOS
  // ==========================================

  verMisPuntos(): void {

    this.vista = 'mios';
    this.puntoSeleccionado = null;
    this.cargandoMisPuntos = true;
    this.errorMisPuntos = '';

    this.registroService
      .listarMisPuntos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (puntos) => {
          this.misPuntos = puntos;
          this.cargandoMisPuntos = false;
          this.cdr.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.cargandoMisPuntos = false;
          if (error.status === 401) {
            this.irAlLogin();
            return;
          }
          this.errorMisPuntos = this.textos.errores.misPuntos;
          this.cdr.markForCheck();
        }
      });
  }


  verDetalle(punto: PuntoAyudaPropio): void {
    this.puntoSeleccionado =
      this.puntoSeleccionado?.id === punto.id ? null : punto;
  }


  registrarOtro(): void {
    this.modelo = this.nuevoModelo();
    this.necesidadIds = [];
    this.donacionesAceptadasIds = [];
    this.registroCreado = null;
    this.puntoSeleccionado = null;
    this.error = '';
    this.errorUbicacion = '';
    this.vista = 'formulario';
    this.cdr.markForCheck();
  }


  etiquetaTipo(tipo: string): string {
    return this.tipos.find(item => item.valor === tipo)?.nombre
      ?? this.textos.etiquetas.tipoDesconocido;
  }


  etiquetaEstado(estado: string): string {
    switch (estado) {
      case ESTADO_VERIFICACION_PUNTO.VERIFICADO: return this.textos.estados.VERIFICADO;
      case ESTADO_VERIFICACION_PUNTO.RECHAZADO: return this.textos.estados.RECHAZADO;
      default: return this.textos.estados.PENDIENTE;
    }
  }


  private irAlLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: '/registrar-punto' }
    });
  }
}

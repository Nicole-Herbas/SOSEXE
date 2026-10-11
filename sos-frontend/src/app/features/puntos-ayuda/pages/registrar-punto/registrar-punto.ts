
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import * as L from 'leaflet';

import {
  APP_TEXTOS
} from '../../../../shared/constants/app-textos.constants';

import {
  ApiResponse
} from '../../../../shared/models/api-response';


// ==========================================
// MODELOS
// ==========================================

interface ItemCatalogo {
  id: number;
  nombre: string;
}


// ==========================================
// COMPONENTE
// ==========================================

@Component({
  selector: 'app-registrar-punto',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './registrar-punto.html',
  styleUrl: './registrar-punto.scss'
})
export class RegistrarPuntoComponent
  implements OnInit, AfterViewInit, OnDestroy {


  // ==========================================
  // SERVICIOS
  // ==========================================

  private readonly http = inject(HttpClient);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);


  // ==========================================
  // CONSTANTES
  // ==========================================

  readonly textos = APP_TEXTOS.registrarPunto;

  readonly tipos = APP_TEXTOS.registrarPunto.tipos;

  private readonly API_PUNTOS = '/api/puntos-ayuda';

  private readonly API_DEPARTAMENTOS = '/api/departamentos';

  private readonly API_NECESIDADES = '/api/necesidades';


  // ==========================================
  // ESTADO GENERAL
  // ==========================================

  departamentos: ItemCatalogo[] = [];

  necesidades: ItemCatalogo[] = [];

  necesidadIds: number[] = [];

  cargandoCatalogos = true;

  enviando = false;

  registrado = false;

  error = '';


  // ==========================================
  // DATOS DEL FORMULARIO
  // ==========================================

  modelo = {
    nombre: '',
    tipo: '',
    descripcion: '',
    direccion: '',
    ciudad: '',

    departamentoId: 0,

    latitud: null as number | null,
    longitud: null as number | null,

    nombreContacto: '',
    telefonoContacto: '',
    correoContacto: ''
  };


  // ==========================================
  // MAPA LEAFLET
  // ==========================================

  @ViewChild('mapaRegistro')
  mapaRegistro!: ElementRef<HTMLDivElement>;

  private mapa?: L.Map;

  private marcador?: L.CircleMarker;


  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {

    this.cargarCatalogos();

  }


  ngAfterViewInit(): void {

    this.inicializarMapa();

  }


  ngOnDestroy(): void {

    this.destruirMapa();

  }


  // ==========================================
  // CARGAR CATÁLOGOS
  // ==========================================

  private cargarCatalogos(): void {

    this.cargandoCatalogos = true;

    this.error = '';

    forkJoin({

      departamentos: this.http.get<ApiResponse<ItemCatalogo[]>>(
        this.API_DEPARTAMENTOS
      ),

      necesidades: this.http.get<ApiResponse<ItemCatalogo[]>>(
        this.API_NECESIDADES
      )

    }).subscribe({

      next: (respuesta) => {

        this.departamentos =
          respuesta.departamentos.data ?? [];

        this.necesidades =
          respuesta.necesidades.data ?? [];

        this.cargandoCatalogos = false;

        if (this.departamentos.length === 0) {

          this.error =
            this.textos.errores.departamentos;

        } else if (this.necesidades.length === 0) {

          this.error =
            this.textos.errores.necesidades;

        }

        this.cdr.markForCheck();

      },

      error: (error: HttpErrorResponse) => {

        console.error(
          'Error al cargar catálogos:',
          error
        );

        this.cargandoCatalogos = false;

        this.error =
          this.textos.errores.registro;

        this.cdr.markForCheck();

      }

    });

  }


  // ==========================================
  // INICIALIZAR MAPA
  // ==========================================

  private inicializarMapa(): void {

    if (!this.mapaRegistro?.nativeElement) {
      return;
    }

    this.mapa = L.map(
      this.mapaRegistro.nativeElement
    ).setView(
      [-16.5, -64.5],
      6
    );

    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }
    ).addTo(this.mapa);

    this.mapa.on(
      'click',
      (evento: L.LeafletMouseEvent) => {

        this.seleccionarUbicacion(
          evento.latlng
        );

      }
    );

    this.mapa.invalidateSize();

  }


  // ==========================================
  // SELECCIONAR UBICACIÓN
  // ==========================================

  private seleccionarUbicacion(
    ubicacion: L.LatLng
  ): void {

    this.modelo.latitud =
      Number(ubicacion.lat.toFixed(7));

    this.modelo.longitud =
      Number(ubicacion.lng.toFixed(7));

    if (!this.mapa) {
      return;
    }

    if (!this.marcador) {

      this.marcador = L.circleMarker(
        ubicacion,
        {
          radius: 9,
          color: '#087f62',
          fillColor: '#12a77a',
          fillOpacity: 1
        }
      ).addTo(this.mapa);

    } else {

      this.marcador.setLatLng(
        ubicacion
      );

    }

    this.cdr.detectChanges();

  }


  // ==========================================
  // LIBERAR MAPA
  // ==========================================

  private destruirMapa(): void {

    this.mapa?.remove();

    this.mapa = undefined;

    this.marcador = undefined;

  }


  // ==========================================
  // SELECCIONAR NECESIDADES
  // ==========================================

  alternarNecesidad(
    id: number,
    seleccionada: boolean
  ): void {

    if (seleccionada) {

      if (!this.necesidadIds.includes(id)) {

        this.necesidadIds = [
          ...this.necesidadIds,
          id
        ];

      }

    } else {

      this.necesidadIds =
        this.necesidadIds.filter(
          necesidadId => necesidadId !== id
        );

    }

  }


  // ==========================================
  // VALIDAR FORMULARIO
  // ==========================================

  get formularioValido(): boolean {

    const datos = this.modelo;

    const telefonoValido =
      /^\+?[0-9]{7,15}$/.test(
        datos.telefonoContacto.trim()
      );

    const correoValido =
      !datos.correoContacto.trim() ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        datos.correoContacto.trim()
      );

    return (

      !this.cargandoCatalogos &&

      !this.enviando &&

      this.departamentos.length > 0 &&

      this.necesidades.length > 0 &&

      datos.nombre.trim().length > 0 &&

      datos.tipo.length > 0 &&

      datos.descripcion.trim().length > 0 &&

      datos.direccion.trim().length > 0 &&

      datos.ciudad.trim().length > 0 &&

      datos.departamentoId > 0 &&

      datos.latitud !== null &&

      datos.longitud !== null &&

      datos.nombreContacto.trim().length > 0 &&

      telefonoValido &&

      correoValido &&

      this.necesidadIds.length > 0

    );

  }


  // ==========================================
  // CONSTRUIR SOLICITUD
  // ==========================================

  private construirSolicitud() {

    const datos = this.modelo;

    return {

      nombre: datos.nombre.trim(),

      tipo: datos.tipo,

      descripcion: datos.descripcion.trim(),

      direccion: datos.direccion.trim(),

      ciudad: datos.ciudad.trim(),

      departamentoId: datos.departamentoId,

      latitud: datos.latitud,

      longitud: datos.longitud,

      necesidadIds: [...this.necesidadIds],

      nombreContacto: datos.nombreContacto.trim(),

      telefonoContacto: datos.telefonoContacto.trim(),

      correoContacto:
        datos.correoContacto.trim() || null

    };

  }


  // ==========================================
  // REGISTRAR PUNTO DE AYUDA
  // ==========================================

  registrar(): void {

    if (!this.formularioValido) {
      return;
    }

    this.enviando = true;

    this.error = '';

    const solicitud =
      this.construirSolicitud();

    this.http
      .post<ApiResponse<unknown>>(
        this.API_PUNTOS,
        solicitud
      )
      .subscribe({

        next: () => {

          this.enviando = false;

          this.registrado = true;

          this.destruirMapa();

          this.cdr.detectChanges();

        },

        error: (error: HttpErrorResponse) => {

          this.enviando = false;

          if (error.status === 401) {

            this.router.navigate(
              ['/login'],
              {
                queryParams: {
                  returnUrl: '/registrar-punto'
                }
              }
            );

            return;

          }

          this.error =
            error.status === 400
              ? this.textos.errores.datos
              : this.textos.errores.registro;

          this.cdr.markForCheck();

        }

      });

  }

}

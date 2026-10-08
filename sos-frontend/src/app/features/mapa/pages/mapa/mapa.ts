import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  MapaLeaflet
} from '../../components/mapa-leaflet/mapa-leaflet';

import {
  FILTROS_NECESIDAD_MAPA,
  FILTROS_TIPO_MAPA,
  PUNTOS_MAPA_FALLBACK,
  TIPO_CLASE_MAPA,
  TIPO_ETIQUETA_MAPA,
} from '../../constants/mapa.constants';

import {
  FEATURE_TOGGLES,
  FeatureToggles
} from '../../../../shared/config/feature-toggles';

import {
  APP_TEXTOS
} from '../../../../shared/constants/app-textos.constants';

import {
  MapaService
} from '../../services/mapa.service';

import {
  PuntoMapa
} from '../../models/punto-mapa.model';


@Component({
  selector: 'app-mapa',
  imports: [
    MapaLeaflet
  ],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss'
})
export class Mapa implements OnInit {

  private mapaService =
    inject(MapaService);


  readonly textos =
    APP_TEXTOS.mapa;

  readonly detalleEtiquetas =
    APP_TEXTOS.mapa.detalle;


  readonly tipoEtiqueta =
    TIPO_ETIQUETA_MAPA;

  readonly filtrosTipo =
    FILTROS_TIPO_MAPA;

  readonly filtrosNecesidad =
    FILTROS_NECESIDAD_MAPA;

  readonly tipoClase =
    TIPO_CLASE_MAPA;


  featureToggles: Pick<FeatureToggles, 'mapa'> = {
    mapa: {
      ...FEATURE_TOGGLES.mapa
    }
  };


  // ==========================================
  // ESTADO GENERAL
  // ==========================================

  puntos =
    signal<PuntoMapa[]>([]);

  cargando =
    signal(true);

  error =
    signal('');

  busqueda =
    signal('');


  // ==========================================
  // FILTROS
  // ==========================================

  filtroTipoActivo =
    signal<string>(
      FILTROS_TIPO_MAPA[0].id
    );

  filtrosNecesidadActivos =
    signal<string[]>([]);


  // ==========================================
  // DETALLE DE PUNTO - SOS-36
  // ==========================================

  puntoSeleccionado =
    signal<PuntoMapa | null>(
      null
    );

  cargandoDetalle =
    signal(false);

  errorDetalle =
    signal('');

  mostrarModalDetalle =
    signal(false);

  mostrarReporte =
    signal(false);

  motivoReporteSeleccionado =
    signal<string | null>(
      null
    );

  reporteDesdeModalDetalle =
    signal(false);

  procesandoReporte =
    signal(false);

  mostrarToastReporte =
    signal(false);


  // ==========================================
  // PUNTOS FILTRADOS
  // ==========================================

  puntosFiltrados = computed(() => {

    let resultado =
      this.puntos();


    if (
      this.featureToggles
        .mapa
        .filtros
    ) {

      const tipo =
        this.filtroTipoActivo();


      if (tipo !== 'todos') {

        resultado =
          resultado.filter(
            p => p.tipo === tipo
          );

      }

      const necesidades =
        this.filtrosNecesidadActivos();


      if (necesidades.length > 0) {

        resultado =
          resultado.filter(
            punto =>
              necesidades.every(
                necesidad =>
                  punto.necesidades
                    ?.includes(necesidad)
              )
          );

      }

    }


    const busqueda =
      this.busqueda()
        .toLowerCase()
        .trim();


    if (busqueda) {

      resultado =
        resultado.filter(
          p =>

            p.nombre
              .toLowerCase()
              .includes(busqueda)

            ||

            p.ciudad
              ?.toLowerCase()
              .includes(busqueda)

            ||

            p.departamentoNombre
              ?.toLowerCase()
              .includes(busqueda)
        );

    }


    return resultado;
  });


  // ==========================================
  // CONTADOR
  // ==========================================

  contadorVerificados = computed(() => {

    const total =
      this.puntos()
        .filter(
          p =>
            p.estadoVerificacion ===
            'VERIFICADO'
        )
        .length;


    return `${total} ${this.textos.contadorVerificados}`;
  });


  // ==========================================
  // INICIO
  // ==========================================

  ngOnInit(): void {

    if (
      this.featureToggles
        .mapa
        .usarBackend
    ) {

      this.cargarPuntosDelBackend();

    } else {

      this.puntos.set(
        PUNTOS_MAPA_FALLBACK as unknown as PuntoMapa[]
      );

      this.cargando.set(
        false
      );

    }
  }


  // ==========================================
  // FILTROS
  // ==========================================

  seleccionarFiltroTipo(
    id: string
  ): void {

    this.filtroTipoActivo.set(
      id
    );
  }


  seleccionarFiltroNecesidad(
    id: string
  ): void {

    if (id === 'todas') {

      this.filtrosNecesidadActivos.set(
        []
      );

      return;
    }


    const seleccionadas =
      this.filtrosNecesidadActivos();


    if (
      seleccionadas.includes(id)
    ) {

      this.filtrosNecesidadActivos.set(
        seleccionadas.filter(
          necesidad =>
            necesidad !== id
        )
      );

      return;
    }


    this.filtrosNecesidadActivos.set([
      ...seleccionadas,
      id
    ]);
  }


  // ==========================================
  // SELECCIONAR PUNTO Y CARGAR DETALLE
  // ==========================================

  seleccionarPunto(
    punto: PuntoMapa
  ): void {

    // Mostramos inmediatamente
    // la información disponible en la lista.
    this.puntoSeleccionado.set(
      punto
    );

    this.errorDetalle.set(
      ''
    );


    // Si se está usando fallback,
    // no consultamos al backend.
    if (
      !this.featureToggles
        .mapa
        .usarBackend
    ) {
      return;
    }


    this.cargandoDetalle.set(
      true
    );


    const origen =
      punto.origen;

    const id =
      punto.id;


    this.mapaService
      .obtenerDetalle(
        origen,
        id
      )
      .subscribe({

        next: (detalle) => {

          const seleccionadoActual =
            this.puntoSeleccionado();


          // Evita que una respuesta antigua
          // reemplace otro punto seleccionado.
          if (
            seleccionadoActual?.id !== id
            ||
            seleccionadoActual?.origen !== origen
          ) {
            return;
          }


          this.puntoSeleccionado.set(
            detalle
          );

          this.cargandoDetalle.set(
            false
          );

        },


        error: () => {

          const seleccionadoActual =
            this.puntoSeleccionado();


          if (
            seleccionadoActual?.id !== id
            ||
            seleccionadoActual?.origen !== origen
          ) {
            return;
          }


          this.errorDetalle.set(
            this.detalleEtiquetas.errorCarga
          );

          this.cargandoDetalle.set(
            false
          );

        }

      });
  }


  // ==========================================
  // MODAL DE DETALLE
  // ==========================================

  abrirModalDetalle(): void {

    if (!this.puntoSeleccionado()) {
      return;
    }


    this.mostrarModalDetalle.set(
      true
    );
  }


  cerrarModalCompleto(): void {

    this.mostrarModalDetalle.set(
      false
    );
  }

  // ==========================================
// REPORTE DE INFORMACIÓN
// ==========================================

  abrirReporte(
    desdeModalDetalle = false
  ): void {

    if (!this.puntoSeleccionado()) {
      return;
    }


    this.reporteDesdeModalDetalle.set(
      desdeModalDetalle
    );

    this.motivoReporteSeleccionado.set(
      null
    );

    this.procesandoReporte.set(
      false
    );

    this.mostrarReporte.set(
      true
    );
  }


  cerrarReporte(): void {

    if (this.procesandoReporte()) {
      return;
    }


    this.mostrarReporte.set(
      false
    );

    this.motivoReporteSeleccionado.set(
      null
    );

    this.reporteDesdeModalDetalle.set(
      false
    );
  }


  seleccionarMotivoReporte(
    motivo: string
  ): void {

    if (this.procesandoReporte()) {
      return;
    }


    this.motivoReporteSeleccionado.set(
      motivo
    );

    this.procesandoReporte.set(
      true
    );


    setTimeout(
      () => {

        const cerrarModalDetalle =
          this.reporteDesdeModalDetalle();


        this.mostrarReporte.set(
          false
        );

        this.procesandoReporte.set(
          false
        );

        this.motivoReporteSeleccionado.set(
          null
        );

        this.reporteDesdeModalDetalle.set(
          false
        );


        if (cerrarModalDetalle) {

          this.mostrarModalDetalle.set(
            false
          );
        }


        this.mostrarConfirmacionReporte();

      },
      700
    );
  }


  private mostrarConfirmacionReporte(): void {

    this.mostrarToastReporte.set(
      true
    );


    setTimeout(
      () => {

        this.mostrarToastReporte.set(
          false
        );

      },
      3000
    );
  }


  // ==========================================
  // CERRAR PANEL DE DETALLE
  // ==========================================

  cerrarDetalle(): void {

    this.mostrarModalDetalle.set(
      false
    );

    this.puntoSeleccionado.set(
      null
    );

    this.errorDetalle.set(
      ''
    );

    this.cargandoDetalle.set(
      false
    );

    this.mostrarReporte.set(
      false
    );

    this.motivoReporteSeleccionado.set(
      null
    );

    this.reporteDesdeModalDetalle.set(
      false
    );

    this.procesandoReporte.set(
      false
    );
  }


  // ==========================================
  // BÚSQUEDA
  // ==========================================

  actualizarBusqueda(
    evento: Event
  ): void {

    const input =
      evento.target as HTMLInputElement;


    this.busqueda.set(
      input.value
    );
  }


  // ==========================================
  // TIPO DEL PUNTO
  // ==========================================

  obtenerClaseTipo(
    tipo: string
  ): string {

    return (
      this.tipoClase[tipo]
      ?? ''
    );
  }


  obtenerEtiquetaTipo(
    tipo: string
  ): string {

    return (
      this.tipoEtiqueta[tipo]
      ??
      tipo.replaceAll(
        '_',
        ' '
      )
    );
  }


  // ==========================================
  // FECHA DE ACTUALIZACIÓN
  // ==========================================

  formatearFechaActualizacion(
    fecha?: string
  ): string {

    if (!fecha) {
      return '';
    }


    const fechaConvertida =
      new Date(fecha);


    if (
      Number.isNaN(
        fechaConvertida.getTime()
      )
    ) {
      return fecha;
    }


    return fechaConvertida
      .toLocaleString(
        'es-BO',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );
  }


  // ==========================================
  // CÓMO LLEGAR
  // ==========================================

  comoLlegar(
    punto: PuntoMapa
  ): void {

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${punto.latitud},${punto.longitud}`;


    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }


  // ==========================================
  // VERIFICACIÓN
  // ==========================================

  estaVerificado(
    punto: PuntoMapa
  ): boolean {

    return (
      punto.estadoVerificacion ===
      'VERIFICADO'
    );
  }


  // ==========================================
  // CARGAR PUNTOS
  // ==========================================

  private cargarPuntosDelBackend(): void {

    this.cargando.set(
      true
    );

    this.error.set(
      ''
    );


    this.mapaService
      .listarPuntos()
      .subscribe({

        next: (puntos) => {

          this.puntos.set(
            puntos
          );

          this.cargando.set(
            false
          );


          if (
            puntos.length > 0
          ) {

            this.seleccionarPunto(
              puntos[0]
            );

          }

        },


        error: () => {

          this.error.set(
            this.textos.errorCarga
          );

          this.cargando.set(
            false
          );


          this.puntos.set(
            PUNTOS_MAPA_FALLBACK as unknown as PuntoMapa[]
          );

        }

      });
  }

}

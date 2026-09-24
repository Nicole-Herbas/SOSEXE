import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MapaLeaflet } from '../../components/mapa-leaflet/mapa-leaflet';
import {
  FILTROS_NECESIDAD_MAPA,
  FILTROS_TIPO_MAPA,
  MAPA_DETALLE_ETIQUETAS,
  MAPA_TEXTOS,
  PUNTOS_MAPA_FALLBACK,
  TIPO_CLASE_MAPA,
} from '../../constants/mapa.constants';
import { FEATURE_TOGGLES } from '../../../../shared/config/feature-toggles';
import { MapaService } from '../../services/mapa.service';
import { PuntoMapa } from '../../models/punto-mapa.model';

@Component({
  selector: 'app-mapa',
  imports: [
    MapaLeaflet
  ],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss'
})
export class Mapa implements OnInit {

  private mapaService = inject(MapaService);

  readonly textos = MAPA_TEXTOS;
  readonly detalleEtiquetas = MAPA_DETALLE_ETIQUETAS;
  readonly filtrosTipo = FILTROS_TIPO_MAPA;
  readonly filtrosNecesidad = FILTROS_NECESIDAD_MAPA;
  readonly tipoClase = TIPO_CLASE_MAPA;
  readonly featureToggles = FEATURE_TOGGLES;

  puntos = signal<PuntoMapa[]>([]);
  cargando = signal(true);
  error = signal('');
  busqueda = signal('');

  filtroTipoActivo = signal<string>(FILTROS_TIPO_MAPA[0].id);
  filtroNecesidadActivo = signal<string>(FILTROS_NECESIDAD_MAPA[0].id);

  puntoSeleccionado = signal<PuntoMapa | null>(null);

  puntosFiltrados = computed(() => {
    let resultado = this.puntos();

    const tipo = this.filtroTipoActivo();
    if (tipo !== 'todos') {
      resultado = resultado.filter(p => p.tipo === tipo);
    }

    const necesidad = this.filtroNecesidadActivo();
    if (necesidad !== 'todas') {
      resultado = resultado.filter(p =>
        p.necesidades?.includes(necesidad)
      );
    }

    const busqueda = this.busqueda().toLowerCase().trim();
    if (busqueda) {
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(busqueda) ||
        (p.ciudad?.toLowerCase().includes(busqueda)) ||
        (p.departamentoNombre?.toLowerCase().includes(busqueda))
      );
    }

    return resultado;
  });

  contadorVerificados = computed(() => {
    const total = this.puntos()
      .filter(p => p.estadoVerificacion === 'VERIFICADO')
      .length;
    return `${total} puntos verificados`;
  });

  ngOnInit(): void {
    if (FEATURE_TOGGLES.mapaUsarBackend) {
      this.cargarPuntosDelBackend();
    } else {
      this.puntos.set(PUNTOS_MAPA_FALLBACK as unknown as PuntoMapa[]);
      this.cargando.set(false);
    }
  }

  seleccionarFiltroTipo(id: string): void {
    this.filtroTipoActivo.set(id);
  }

  seleccionarFiltroNecesidad(id: string): void {
    this.filtroNecesidadActivo.set(id);
  }

  seleccionarPunto(punto: PuntoMapa): void {
    this.puntoSeleccionado.set(punto);
  }

  cerrarDetalle(): void {
    this.puntoSeleccionado.set(null);
  }

  actualizarBusqueda(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.busqueda.set(input.value);
  }

  obtenerClaseTipo(tipo: string): string {
    return this.tipoClase[tipo] ?? '';
  }

  estaVerificado(punto: PuntoMapa): boolean {
    return punto.estadoVerificacion === 'VERIFICADO';
  }

  private cargarPuntosDelBackend(): void {
    this.cargando.set(true);
    this.error.set('');

    this.mapaService.listarPuntos().subscribe({
      next: (puntos) => {
        this.puntos.set(puntos);
        this.cargando.set(false);

        if (puntos.length > 0) {
          this.puntoSeleccionado.set(puntos[0]);
        }
      },
      error: () => {
        this.error.set(this.textos.errorCarga);
        this.cargando.set(false);

        // Fallback a datos estáticos si el backend falla
        this.puntos.set(PUNTOS_MAPA_FALLBACK as unknown as PuntoMapa[]);
      }
    });
  }

}

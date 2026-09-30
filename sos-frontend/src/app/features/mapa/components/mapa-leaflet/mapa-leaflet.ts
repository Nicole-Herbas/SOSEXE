import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import * as L from 'leaflet';
import { PuntoMapa } from '../../models/punto-mapa.model';

const COLORES_MARCADOR: Record<string, string> = {
  CENTRO_APOYO: '#218aa0',
  REFUGIO: '#149b8c',
  PUNTO_DONACION: '#dda638',
  EMERGENCIA: '#ed5142',
};

const COLOR_SELECCIONADO = '#0d6efd';
const COLOR_DEFAULT = '#218aa0';

@Component({
  selector: 'app-mapa-leaflet',
  imports: [],
  templateUrl: './mapa-leaflet.html',
  styleUrl: './mapa-leaflet.scss'
})
export class MapaLeaflet implements AfterViewInit, OnDestroy, OnChanges {

  @ViewChild('mapa')
  mapaElement!: ElementRef<HTMLDivElement>;

  @Input()
  puntos: PuntoMapa[] = [];

  @Input()
  puntoSeleccionado: PuntoMapa | null = null;

  @Output()
  puntoClick = new EventEmitter<PuntoMapa>();

  private mapa?: L.Map;
  
  private marcadoresDiccionario = new Map<string, L.Marker>();

  ngAfterViewInit(): void {
    this.mapa = L.map(this.mapaElement.nativeElement).setView([-16.5, -64.5], 6);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.mapa);

    this.renderizarMarcadores();
    this.centrarEnPuntoSeleccionado();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mapa) {
      return;
    }

    if (changes['puntos']) {
      this.renderizarMarcadores();
      if (this.puntoSeleccionado) {
        this.centrarEnPuntoSeleccionado();
      }
    } 
    else if (changes['puntoSeleccionado']) {
      const viejo = changes['puntoSeleccionado'].previousValue;
      const nuevo = changes['puntoSeleccionado'].currentValue;
      
      // Apagamos el resaltado del marcador anterior
      if (viejo) {
        this.actualizarIconoMarcador(viejo, false);
      }
      
      if (nuevo) {
        this.actualizarIconoMarcador(nuevo, true);
        this.centrarEnPuntoSeleccionado();
      }
    }
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

  private renderizarMarcadores(): void {
    if (!this.mapa) {
      return;
    }

    this.marcadoresDiccionario.forEach(marcador => marcador.remove());
    this.marcadoresDiccionario.clear();

    for (const punto of this.puntos) {
      if (punto.latitud === undefined || punto.longitud === undefined || punto.latitud === null) {
        continue;
      }

      const estaSeleccionado = this.esElPuntoSeleccionado(punto);
      const icono = this.generarIcono(punto, estaSeleccionado);

      const marcador = L.marker([punto.latitud, punto.longitud], { icon: icono });

      marcador.bindTooltip(punto.nombre, { direction: 'top', offset: [0, -10] });
      
      marcador.on('click', () => {
        this.puntoClick.emit(punto);
      });

      marcador.addTo(this.mapa);
      this.marcadoresDiccionario.set(this.obtenerIdUnico(punto), marcador);
    }
  }

  private actualizarIconoMarcador(punto: PuntoMapa, estaSeleccionado: boolean): void {
    const idUnico = this.obtenerIdUnico(punto);
    const marcador = this.marcadoresDiccionario.get(idUnico);
    
    if (marcador) {
      marcador.setIcon(this.generarIcono(punto, estaSeleccionado));
    }
  }

  private generarIcono(punto: PuntoMapa, estaSeleccionado: boolean): L.DivIcon {
    const color = estaSeleccionado ? COLOR_SELECCIONADO : (COLORES_MARCADOR[punto.tipo] ?? COLOR_DEFAULT);
    const tamanio = estaSeleccionado ? 34 : 28;

    return L.divIcon({
      className: 'marcador-personalizado',
      html: `
        <div class="pin-mapa ${estaSeleccionado ? 'seleccionado' : ''}" style="--color-pin: ${color};">
          <span></span>
        </div>
      `,
      iconSize: [tamanio, tamanio],
      iconAnchor: [tamanio / 2, tamanio],
      tooltipAnchor: [0, -tamanio]
    });
  }

  private centrarEnPuntoSeleccionado(): void {
    if (!this.mapa || !this.puntoSeleccionado || !this.puntoSeleccionado.latitud) {
      return;
    }

    this.mapa.flyTo(
      [this.puntoSeleccionado.latitud, this.puntoSeleccionado.longitud],
      14,
      { animate: true, duration: 1.5 }
    );
  }

  private esElPuntoSeleccionado(punto: PuntoMapa): boolean {
    return this.puntoSeleccionado?.id === punto.id && this.puntoSeleccionado?.origen === punto.origen;
  }

  private obtenerIdUnico(punto: PuntoMapa): string {
    return `${punto.id}-${punto.origen}`;
  }
}
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

  @Input() puntos: PuntoMapa[] = [];
  @Input() puntoSeleccionado: PuntoMapa | null = null;
  @Output() puntoClick = new EventEmitter<PuntoMapa>();

  private mapa?: L.Map;
  private marcadores: L.CircleMarker[] = [];

  ngAfterViewInit(): void {

    this.mapa = L.map(
      this.mapaElement.nativeElement
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

    this.renderizarMarcadores();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mapa) return;

    if (changes['puntos'] || changes['puntoSeleccionado']) {
      this.renderizarMarcadores();
    }
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

  private renderizarMarcadores(): void {
    if (!this.mapa) return;

    this.marcadores.forEach(m => m.remove());
    this.marcadores = [];

    for (const punto of this.puntos) {
      const estaSeleccionado =
        this.puntoSeleccionado?.id === punto.id &&
        this.puntoSeleccionado?.origen === punto.origen;

      const color = estaSeleccionado
        ? COLOR_SELECCIONADO
        : (COLORES_MARCADOR[punto.tipo] ?? COLOR_DEFAULT);

      const marcador = L.circleMarker(
        [punto.latitud, punto.longitud],
        {
          radius: estaSeleccionado ? 12 : 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        }
      );

      marcador.bindTooltip(punto.nombre, {
        direction: 'top',
        offset: [0, -10],
      });

      marcador.on('click', () => {
        this.puntoClick.emit(punto);
      });

      marcador.addTo(this.mapa!);
      this.marcadores.push(marcador);
    }

    if (this.puntoSeleccionado && this.mapa) {
      this.mapa.setView(
        [this.puntoSeleccionado.latitud, this.puntoSeleccionado.longitud],
        8,
        { animate: true }
      );
    }
  }

}
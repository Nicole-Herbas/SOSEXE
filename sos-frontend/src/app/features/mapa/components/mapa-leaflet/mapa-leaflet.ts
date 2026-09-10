import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import * as L from 'leaflet';

@Component({
  selector: 'app-mapa-leaflet',
  imports: [],
  templateUrl: './mapa-leaflet.html',
  styleUrl: './mapa-leaflet.scss'
})
export class MapaLeaflet implements AfterViewInit, OnDestroy {

  @ViewChild('mapa')
  mapaElement!: ElementRef<HTMLDivElement>;

  private mapa?: L.Map;

  ngAfterViewInit(): void {

    this.mapa = L.map(
      this.mapaElement.nativeElement
    ).setView(
      [-16.5, -64.5],
      5
    );

    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }
    ).addTo(this.mapa);

  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

}
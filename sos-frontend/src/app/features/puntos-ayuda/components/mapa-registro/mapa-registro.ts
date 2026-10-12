import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

import * as L from 'leaflet';

import { UbicacionSeleccionada } from '../../models/registrar-punto.model';


@Component({
  selector: 'app-mapa-registro',
  templateUrl: './mapa-registro.html',
  styleUrl: './mapa-registro.scss'
})
export class MapaRegistroComponent implements AfterViewInit, OnDestroy {

  @Input() latitud: number | null = null;
  @Input() longitud: number | null = null;
  @Input() textoUbicacion = '';
  @Input() etiquetaMapa = '';

  @Output() ubicacionSeleccionada =
    new EventEmitter<UbicacionSeleccionada>();

  @Output() errorUbicacion =
    new EventEmitter<'NO_DISPONIBLE' | 'PERMISO_DENEGADO'>();

  @ViewChild('mapa')
  mapaElemento!: ElementRef<HTMLDivElement>;

  private mapa?: L.Map;
  private marcador?: L.CircleMarker;


  ngAfterViewInit(): void {

    this.mapa = L.map(this.mapaElemento.nativeElement)
      .setView([-16.5, -64.5], 6);

    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }
    ).addTo(this.mapa);

    this.mapa.on('click', (evento: L.LeafletMouseEvent) => {
      this.actualizarUbicacion(evento.latlng);
    });

    if (this.latitud !== null && this.longitud !== null) {
      const ubicacion = L.latLng(this.latitud, this.longitud);
      this.mapa.setView(ubicacion, 14);
      this.actualizarMarcador(ubicacion);
    }

    this.mapa.invalidateSize();
  }


  usarMiUbicacion(): void {

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.errorUbicacion.emit('NO_DISPONIBLE');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      posicion => {
        const ubicacion = L.latLng(
          posicion.coords.latitude,
          posicion.coords.longitude
        );
        this.mapa?.setView(ubicacion, 15);
        this.actualizarUbicacion(ubicacion);
      },
      () => this.errorUbicacion.emit('PERMISO_DENEGADO'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }


  private actualizarUbicacion(ubicacion: L.LatLng): void {

    this.actualizarMarcador(ubicacion);

    this.ubicacionSeleccionada.emit({
      latitud: Number(ubicacion.lat.toFixed(7)),
      longitud: Number(ubicacion.lng.toFixed(7))
    });
  }


  private actualizarMarcador(ubicacion: L.LatLng): void {

    if (!this.mapa) {
      return;
    }

    if (!this.marcador) {
      this.marcador = L.circleMarker(ubicacion, {
        radius: 9,
        color: '#ffffff',
        weight: 3,
        fillColor: '#008b88',
        fillOpacity: 1
      }).addTo(this.mapa);
    } else {
      this.marcador.setLatLng(ubicacion);
    }
  }


  ngOnDestroy(): void {
    this.mapa?.remove();
    this.mapa = undefined;
    this.marcador = undefined;
  }
}

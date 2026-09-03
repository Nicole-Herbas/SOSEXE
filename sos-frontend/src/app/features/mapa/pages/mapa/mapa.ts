import { Component } from '@angular/core';
import { MapaLeaflet } from '../../components/mapa-leaflet/mapa-leaflet';

@Component({
  selector: 'app-mapa',
  imports: [
    MapaLeaflet
  ],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss'
})
export class Mapa {

}
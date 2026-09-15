import { Component } from '@angular/core';
import { MapaLeaflet } from '../../components/mapa-leaflet/mapa-leaflet';
import {
  DONACIONES_ACEPTADAS,
  FILTROS_NECESIDAD_MAPA,
  FILTROS_TIPO_MAPA,
  MAPA_TEXTOS,
  NECESIDADES_PRIORITARIAS,
  PUNTOS_MAPA,
} from '../../constants/mapa.constants';

@Component({
  selector: 'app-mapa',
  imports: [
    MapaLeaflet
  ],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss'
})
export class Mapa {
  readonly textos = MAPA_TEXTOS;
  readonly filtrosTipo = FILTROS_TIPO_MAPA;
  readonly filtrosNecesidad = FILTROS_NECESIDAD_MAPA;
  readonly puntos = PUNTOS_MAPA;
  readonly necesidadesPrioritarias = NECESIDADES_PRIORITARIAS;
  readonly donacionesAceptadas = DONACIONES_ACEPTADAS;

  filtroTipoActivo: string = FILTROS_TIPO_MAPA[0].id;
  filtroNecesidadActivo: string = FILTROS_NECESIDAD_MAPA[0].id;

  seleccionarFiltroTipo(id: string): void {
    this.filtroTipoActivo = id;
  }

  seleccionarFiltroNecesidad(id: string): void {
    this.filtroNecesidadActivo = id;
  }

}

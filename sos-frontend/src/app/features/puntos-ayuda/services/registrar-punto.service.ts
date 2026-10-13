import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

import { ApiResponse } from '../../../shared/models/api-response';

import {
  ItemCatalogo,
  PuntoAyudaPropio,
  RegistroPuntoSolicitud
} from '../models/registrar-punto.model';


@Injectable({
  providedIn: 'root'
})
export class RegistrarPuntoService {

  private readonly http = inject(HttpClient);

  private readonly API_PUNTOS = '/api/puntos-ayuda';
  private readonly API_DEPARTAMENTOS = '/api/departamentos';
  private readonly API_NECESIDADES = '/api/necesidades';


  cargarCatalogos(): Observable<{
    departamentos: ItemCatalogo[];
    necesidades: ItemCatalogo[];
  }> {

    return forkJoin({
      departamentos: this.http
        .get<ApiResponse<ItemCatalogo[]>>(this.API_DEPARTAMENTOS)
        .pipe(map(respuesta => respuesta.data ?? [])),
      necesidades: this.http
        .get<ApiResponse<ItemCatalogo[]>>(this.API_NECESIDADES)
        .pipe(map(respuesta => respuesta.data ?? []))
    });
  }


  registrar(
    solicitud: RegistroPuntoSolicitud
  ): Observable<PuntoAyudaPropio> {

    return this.http
      .post<ApiResponse<PuntoAyudaPropio>>(
        this.API_PUNTOS,
        solicitud
      )
      .pipe(map(respuesta => respuesta.data));
  }


  listarMisPuntos(): Observable<PuntoAyudaPropio[]> {

    return this.http
      .get<ApiResponse<PuntoAyudaPropio[]>>(
        `${this.API_PUNTOS}/mios`
      )
      .pipe(map(respuesta => respuesta.data ?? []));
  }
}

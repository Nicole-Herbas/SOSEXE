import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

import { ApiResponse } from '../../../shared/models/api-response';

import {
  ItemCatalogo,
  FiltrosRevisionPuntos,
  PuntoAyuda,
  PuntoAyudaPropio,
  RegistroPuntoSolicitud
} from '../models/registrar-punto.model';
import { ESTADO_VERIFICACION_PUNTO } from '../models/estado-punto.constants';


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
      departamentos: this.cargarDepartamentos(),
      necesidades: this.http
        .get<ApiResponse<ItemCatalogo[]>>(this.API_NECESIDADES)
        .pipe(map(respuesta => respuesta.data ?? []))
    });
  }

  cargarDepartamentos(): Observable<ItemCatalogo[]> {
    return this.http.get<ApiResponse<ItemCatalogo[]>>(this.API_DEPARTAMENTOS)
      .pipe(map(respuesta => respuesta.data ?? []));
  }

  listarParaRevision(
    filtros: FiltrosRevisionPuntos = { estado: ESTADO_VERIFICACION_PUNTO.PENDIENTE }
  ): Observable<PuntoAyuda[]> {
    let params = new HttpParams().set('estado', filtros.estado);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.departamentoId != null) params = params.set('departamentoId', filtros.departamentoId);
    if (filtros.buscar?.trim()) params = params.set('buscar', filtros.buscar.trim());
    return this.http.get<ApiResponse<PuntoAyuda[]>>(`${this.API_PUNTOS}/admin`, { params })
      .pipe(map(respuesta => {
        if (!respuesta.success || !Array.isArray(respuesta.data)) {
          throw new Error('Respuesta de listado administrativo inválida');
        }
        return respuesta.data;
      }));
  }

  obtenerDetalleAdmin(id: number): Observable<PuntoAyuda> {
    return this.http.get<ApiResponse<PuntoAyuda>>(`${this.API_PUNTOS}/admin/${id}`)
      .pipe(map(respuesta => {
        if (!respuesta.success || !respuesta.data || respuesta.data.id !== id) {
          throw new Error('Respuesta de detalle administrativo inválida');
        }
        return respuesta.data;
      }));
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

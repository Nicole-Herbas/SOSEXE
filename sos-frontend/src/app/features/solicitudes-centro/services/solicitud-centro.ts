import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { SolicitudCentro } from '../models/solicitud-centro';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class SolicitudCentroService {

  private http = inject(HttpClient);

  private apiUrl = '/api/solicitudes-centro';

  listarTodas(): Observable<SolicitudCentro[]> {

    return this.http
      .get<ApiResponse<SolicitudCentro[]>>(this.apiUrl)
      .pipe(
        map(respuesta => respuesta.data)
      );
  }

  buscarPorId(id: number): Observable<SolicitudCentro> {

    return this.http
      .get<ApiResponse<SolicitudCentro>>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        map(respuesta => respuesta.data)
      );
  }

  cambiarEstado(
    id: number,
    estado: string,
    observacion: string
  ): Observable<SolicitudCentro> {

    return this.http
      .patch<ApiResponse<SolicitudCentro>>(
        `${this.apiUrl}/${id}/estado`,
        {
          estado,
          observacion
        }
      )
      .pipe(
        map(respuesta => respuesta.data)
      );
  }
}
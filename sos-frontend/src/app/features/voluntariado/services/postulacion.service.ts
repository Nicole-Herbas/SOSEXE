import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiResponse } from '../../../shared/models/api-response';
import { GESTIONAR_SESION_EN_COMPONENTE } from '../../auth/interceptors/auth.interceptor';
import { CrearPostulacion, Postulacion } from '../models/postulacion';

@Injectable({ providedIn: 'root' })
export class PostulacionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/postulaciones';

  listarMias(): Observable<ApiResponse<Postulacion[]>> {
    return this.http.get<ApiResponse<Postulacion[]>>(`${this.apiUrl}/mias`, {
      context: this.contextoSesion(),
    });
  }

  crear(solicitud: CrearPostulacion): Observable<ApiResponse<Postulacion>> {
    // Selección explícita: nunca transmite identidad, estado ni otros campos de respuesta.
    const body: CrearPostulacion = {
      voluntariadoId: solicitud.voluntariadoId,
      disponibilidad: solicitud.disponibilidad,
      ...(solicitud.comentario !== undefined ? { comentario: solicitud.comentario } : {}),
    };
    return this.http.post<ApiResponse<Postulacion>>(this.apiUrl, body, {
      context: this.contextoSesion(), observe: 'response',
    }).pipe(map(respuesta => {
      if (respuesta.status !== 201 || !respuesta.body?.success || !respuesta.body.data) {
        throw new HttpErrorResponse({ status: respuesta.status, url: this.apiUrl });
      }
      return respuesta.body;
    }));
  }

  private contextoSesion(): HttpContext {
    return new HttpContext().set(GESTIONAR_SESION_EN_COMPONENTE, true);
  }
}

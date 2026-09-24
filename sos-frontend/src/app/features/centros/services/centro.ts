import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Centro } from '../models/centro';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class CentroService {

  private http = inject(HttpClient);

  private apiUrl = '/api/centros';


  listarTodos(): Observable<Centro[]> {

    return this.http
      .get<ApiResponse<Centro[]>>(this.apiUrl)
      .pipe(
        map(respuesta => respuesta.data)
      );

  }


  buscarPorId(id: number): Observable<Centro> {

    return this.http
      .get<ApiResponse<Centro>>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        map(respuesta => respuesta.data)
      );

  }


  crear(centro: Centro): Observable<Centro> {

    return this.http
      .post<ApiResponse<Centro>>(
        this.apiUrl,
        centro
      )
      .pipe(
        map(respuesta => respuesta.data)
      );

  }


  actualizar(
    id: number,
    centro: Centro
  ): Observable<Centro> {

    return this.http
      .put<ApiResponse<Centro>>(
        `${this.apiUrl}/${id}`,
        centro
      )
      .pipe(
        map(respuesta => respuesta.data)
      );

  }


  eliminar(id: number): Observable<void> {

    return this.http
      .delete<ApiResponse<void>>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        map(() => undefined)
      );

  }

}
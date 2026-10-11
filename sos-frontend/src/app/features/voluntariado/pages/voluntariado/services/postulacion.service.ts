import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../../../shared/models/api-response';
import { Postulacion } from '../models/postulacion.model';

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/postulaciones';

  listarMias(): Observable<Postulacion[]> {

    return this.http
      .get<ApiResponse<Postulacion[]>>(
        `${this.apiUrl}/mias`
      )
      .pipe(
        map(respuesta => respuesta.data)
      );

  }

}
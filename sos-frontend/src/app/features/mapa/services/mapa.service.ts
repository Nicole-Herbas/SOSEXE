import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { PuntoMapa } from '../models/punto-mapa.model';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class MapaService {

  private http = inject(HttpClient);

  private apiUrl = '/api/mapa';


  listarPuntos(): Observable<PuntoMapa[]> {

    return this.http
      .get<ApiResponse<PuntoMapa[]>>(`${this.apiUrl}/puntos`)
      .pipe(
        map(respuesta => respuesta.data)
      );

  }

}

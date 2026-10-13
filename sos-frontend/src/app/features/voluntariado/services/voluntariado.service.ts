import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../shared/models/api-response';
import { OportunidadVoluntariado } from '../models/oportunidad-voluntariado';

@Injectable({ providedIn: 'root' })
export class VoluntariadoService {
  private readonly apiUrl = '/api/voluntariados';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ApiResponse<OportunidadVoluntariado[]>> {
    return this.http.get<ApiResponse<OportunidadVoluntariado[]>>(this.apiUrl);
  }

  obtenerPublicadaPorId(id: number): Observable<ApiResponse<OportunidadVoluntariado>> {
    return this.http.get<ApiResponse<OportunidadVoluntariado>>(`${this.apiUrl}/publicos/${id}`);
  }
}

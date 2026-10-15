import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PerfilVoluntario } from '../models/perfil-voluntario';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class PerfilVoluntarioService {

  private apiUrl = '/api/perfil-voluntario';

  constructor(private http: HttpClient) {}


  crear(
    perfil: PerfilVoluntario
  ): Observable<ApiResponse<PerfilVoluntario>> {

    return this.http.post<ApiResponse<PerfilVoluntario>>(
      this.apiUrl,
      perfil
    );
  }


  obtenerMiPerfil(): Observable<ApiResponse<PerfilVoluntario>> {

    return this.http.get<ApiResponse<PerfilVoluntario>>(
      `${this.apiUrl}/me`
    );
  }


  actualizar(
    perfil: PerfilVoluntario
  ): Observable<ApiResponse<PerfilVoluntario>> {

    return this.http.put<ApiResponse<PerfilVoluntario>>(
      `${this.apiUrl}/me`,
      perfil
    );
  }


  existeMiPerfil(): Observable<ApiResponse<boolean>> {

    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/me/existe`
    );
  }
}

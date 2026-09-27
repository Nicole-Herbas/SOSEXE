import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginRequest } from '../models/login-request';
import { AuthResponse } from '../models/auth-response';
import { AuthUser } from '../models/auth-user';
import { RegistroRequest } from '../models/registro-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login(
    credenciales: LoginRequest
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      credenciales
    );

  }

  registrar(
    datos: RegistroRequest
  ): Observable<string> {

    return this.http.post(
      `${this.apiUrl}/registro`,
      datos,
      { responseType: 'text' }
    );

  }

  usuarioActual(): Observable<AuthUser> {

    return this.http.get<AuthUser>(
      `${this.apiUrl}/me`
    );

  }

  refrescarToken(): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/refresh`,
      {},
      {
        withCredentials: true
      }
    );
  }
  logout(): Observable<void> {

    return this.http.post<void>(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true
      }
    );

  }

}

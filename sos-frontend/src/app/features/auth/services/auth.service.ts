import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { LoginRequest } from '../models/login-request';
import { AuthResponse } from '../models/auth-response';
import { AuthUser } from '../models/auth-user';
import { RegistroRequest } from '../models/registro-request';
import { eliminarBorradorDeUsuario } from '../../acerca-de/utils/borrador-registro-centro';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api/auth';

  private readonly STORAGE_TOKEN  = 'token';
  private readonly STORAGE_NOMBRE = 'usuario_nombre';
  private readonly STORAGE_EMAIL  = 'usuario_email';

  private sesionActiva$ = new BehaviorSubject<boolean>(
    this.estaAutenticado()
  );

  readonly sesion$ = this.sesionActiva$.asObservable();

  constructor(private http: HttpClient) {}


  login(
    credenciales: LoginRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        credenciales
      )
      .pipe(
        tap(respuesta => {

          localStorage.setItem(
            this.STORAGE_TOKEN,
            respuesta.token
          );

          localStorage.setItem(
            this.STORAGE_NOMBRE,
            respuesta.nombre
          );

          localStorage.setItem(
            this.STORAGE_EMAIL,
            respuesta.email
          );

          this.sesionActiva$.next(true);

        })
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
    ).pipe(
            tap(() => {

        // SOS-42 (QA): al cerrar sesión se borra el borrador de registro
        // de centro de ESTE usuario (útil en computadoras compartidas).
        const email = localStorage.getItem(this.STORAGE_EMAIL);

        if (email) {
          eliminarBorradorDeUsuario(email).catch(() => {
            // Si falla, el borrador igual vence solo a los 7 días.
          });
        }

        localStorage.removeItem(this.STORAGE_TOKEN);
        localStorage.removeItem(this.STORAGE_NOMBRE);
        localStorage.removeItem(this.STORAGE_EMAIL);

        this.sesionActiva$.next(false);

      })
    );

  }


  estaAutenticado(): boolean {

    return !!localStorage.getItem(this.STORAGE_TOKEN);

  }


  obtenerNombreUsuario(): string {

    return localStorage.getItem(this.STORAGE_NOMBRE) ?? '';

  }

}

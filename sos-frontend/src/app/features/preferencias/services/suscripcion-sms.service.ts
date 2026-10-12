import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SuscripcionSms } from '../models/suscripcion-sms.model';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionSmsService {

  private apiUrl = '/api/suscripcion-sms';

  constructor(private http: HttpClient) {}

  suscribir(
    datos: SuscripcionSms
  ): Observable<ApiResponse<SuscripcionSms>> {
    return this.http.post<ApiResponse<SuscripcionSms>>(
      this.apiUrl,
      datos
    );
  }

  obtenerSuscripcion(): Observable<ApiResponse<SuscripcionSms>> {
    return this.http.get<ApiResponse<SuscripcionSms>>(
      `${this.apiUrl}/me`
    );
  }

  existeSuscripcion(): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/me/existe`
    );
  }
}

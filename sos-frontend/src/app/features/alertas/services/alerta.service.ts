import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../../shared/models/api-response';
import { Alerta, CrearAlerta, Departamento } from '../models/alerta.model';

@Injectable({ providedIn: 'root' })
export class AlertaService {
  private readonly http = inject(HttpClient);

  departamentos() {
    return this.http.get<ApiResponse<Departamento[]>>('/api/departamentos');
  }

  crear(datos: CrearAlerta) {
    return this.http.post<ApiResponse<Alerta>>('/api/alertas', datos);
  }

  borradores() {
    return this.http.get<ApiResponse<Alerta[]>>('/api/alertas/borradores');
  }

  revisar(id: number) {
    return this.http.get<ApiResponse<Alerta>>(`/api/alertas/${id}/revision`);
  }

  publicar(id: number, version: number) {
    return this.http.post<ApiResponse<Alerta>>(`/api/alertas/${id}/publicar`, {
      confirmado: true,
      version,
    });
  }
}

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
}

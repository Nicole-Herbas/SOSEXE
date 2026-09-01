import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Centro } from '../models/centro';

@Injectable({
  providedIn: 'root'
})
export class CentroService {

  private http = inject(HttpClient);

  private apiUrl = '/api/centros';

  listarTodos(): Observable<Centro[]> {
    return this.http.get<Centro[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Centro> {
    return this.http.get<Centro>(`${this.apiUrl}/${id}`);
  }

  crear(centro: Centro): Observable<Centro> {
    return this.http.post<Centro>(this.apiUrl, centro);
  }

  actualizar(id: number, centro: Centro): Observable<Centro> {
    return this.http.put<Centro>(
      `${this.apiUrl}/${id}`,
      centro
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
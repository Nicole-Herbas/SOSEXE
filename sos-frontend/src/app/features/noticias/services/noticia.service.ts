import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

import { ApiResponse } from '../../../shared/models/api-response';
import {
  Noticia,
  NoticiaExterna,
  NoticiaPublicada,
} from '../models/noticia.model';

@Injectable({ providedIn: 'root' })
export class NoticiaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/noticias';

  listarNoticias(): Observable<Noticia[]> {
    return forkJoin({
      publicadas: this.http.get<ApiResponse<NoticiaPublicada[]>>(
        `${this.apiUrl}/publicas`,
      ),
      externas: this.http.get<ApiResponse<NoticiaExterna[]>>(
        `${this.apiUrl}/externas`,
      ),
    }).pipe(
      map(({ publicadas, externas }) =>
        [
          ...publicadas.data.map((noticia) => this.normalizarPublicada(noticia)),
          ...externas.data.map((noticia) => this.normalizarExterna(noticia)),
        ].sort(
          (a, b) =>
            this.aMilisegundos(b.fechaPublicacion) -
            this.aMilisegundos(a.fechaPublicacion),
        ),
      ),
    );
  }

  private normalizarPublicada(noticia: NoticiaPublicada): Noticia {
    return {
      id: noticia.id,
      titulo: noticia.titulo,
      resumen: noticia.contenido,
      imagenUrl: noticia.imagenUrl,
      fuente: noticia.fuente,
      categoria: noticia.categoria,
      ubicacion: 'Bolivia',
      fechaPublicacion: noticia.fechaPublicacion,
      esExterna: false,
    };
  }

  private normalizarExterna(noticia: NoticiaExterna): Noticia {
    return {
      id: noticia.id,
      titulo: noticia.titulo ?? '',
      resumen: noticia.descripcion ?? '',
      url: noticia.url,
      imagenUrl: noticia.imagenUrl,
      fuente: noticia.fuente,
      categoria: noticia.categoria ?? 'Noticias',
      ubicacion: noticia.pais ?? 'Bolivia',
      fechaPublicacion: noticia.fechaPublicacion,
      esExterna: true,
    };
  }

  private aMilisegundos(fecha: string | null): number {
    if (!fecha) {
      return 0;
    }

    const milisegundos = Date.parse(fecha.replace(' ', 'T'));
    return Number.isNaN(milisegundos) ? 0 : milisegundos;
  }
}
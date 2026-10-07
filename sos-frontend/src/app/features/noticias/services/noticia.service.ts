import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { ApiResponse } from '../../../shared/models/api-response';
import {
  Noticia,
  NoticiaExterna,
  NoticiaPublicada,
  ResultadoNoticias,
  ResultadoNoticiasExternas,
} from '../models/noticia.model';
import { normalizarCategoriaExterna } from '../utils/categoria-noticia';

@Injectable({ providedIn: 'root' })
export class NoticiaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/noticias';

  listarNoticias(
    fuentes: { propias?: boolean; externas?: boolean } = {},
  ): Observable<ResultadoNoticias> {
    const incluirPropias = fuentes.propias ?? true;
    const incluirExternas = fuentes.externas ?? true;
    const propias$ = incluirPropias
      ? this.http.get<ApiResponse<NoticiaPublicada[]>>(`${this.apiUrl}/publicas`)
      : of<ApiResponse<NoticiaPublicada[]>>({
          success: true,
          message: '',
          data: [],
          timestamp: '',
        });
    const externas$ = incluirExternas
      ? this.http
          .get<ApiResponse<ResultadoNoticiasExternas>>(`${this.apiUrl}/externas`)
          .pipe(catchError(() => of(null)))
      : of(null);

    return forkJoin({
      publicadas: propias$,
      externas: externas$,
    }).pipe(
      map(({ publicadas, externas }) => {
        const noticias = [
          ...publicadas.data.map((noticia) => this.normalizarPublicada(noticia)),
          ...(externas?.data.noticias ?? []).map((noticia) => this.normalizarExterna(noticia)),
        ].sort(
          (a, b) =>
            this.aMilisegundos(b.fechaPublicacion) -
            this.aMilisegundos(a.fechaPublicacion),
        );

        return {
          noticias,
          apiExternaDisponible: incluirExternas
            ? externas?.data.apiDisponible ?? false
            : null,
          noticiasExternasDesdeCache: externas?.data.desdeCache ?? false,
        };
      }),
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
      ubicacion: '',
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
      categoria: normalizarCategoriaExterna(noticia.categoria),
      ubicacion: noticia.pais ?? '',
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
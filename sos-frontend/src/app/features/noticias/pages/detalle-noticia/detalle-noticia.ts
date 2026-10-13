import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { NoticiaPublicada } from '../../models/noticia.model';
import { NoticiaService } from '../../services/noticia.service';

@Component({
  selector: 'app-detalle-noticia',
  imports: [RouterLink],
  templateUrl: './detalle-noticia.html',
  styleUrl: './detalle-noticia.scss',
})
export class DetalleNoticia {
  private readonly route = inject(ActivatedRoute);
  private readonly noticiaService = inject(NoticiaService);
  private readonly reintentos = new Subject<void>();

  readonly textos = APP_TEXTOS.noticias.detalle;
  readonly noticia = signal<NoticiaPublicada | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<'idInvalido' | 'noEncontrada' | 'conexion' | null>(null);
  readonly imagenFallida = signal(false);
  readonly fechaFormateada = computed(() => {
    const valor = this.noticia()?.fechaPublicacion;
    const fecha = valor ? new Date(valor.replace(' ', 'T')) : null;
    return fecha && !Number.isNaN(fecha.getTime())
      ? new Intl.DateTimeFormat('es-BO', {
          day: 'numeric', month: 'short', year: 'numeric',
        }).format(fecha)
      : null;
  });
  readonly imagenUrl = computed(() => {
    const valor = this.noticia()?.imagenUrl?.trim();
    if (!valor || this.imagenFallida()) return null;
    try {
      const url = new URL(valor, window.location.origin);
      return /^(https?:\/\/|\/(?!\/))/.test(valor) && ['http:', 'https:'].includes(url.protocol)
        ? valor : null;
    } catch {
      return null;
    }
  });

  constructor() {
    this.route.paramMap.pipe(
      switchMap((parametros) => this.reintentos.pipe(
        startWith(undefined),
        switchMap(() => this.consultar(parametros.get('id'))),
      )),
      takeUntilDestroyed(),
    ).subscribe((noticia) => {
      this.noticia.set(noticia);
      this.cargando.set(false);
    });
  }

  reintentar(): void {
    this.reintentos.next();
  }

  private consultar(valor: string | null): Observable<NoticiaPublicada | null> {
    this.noticia.set(null);
    this.error.set(null);
    this.cargando.set(true);
    this.imagenFallida.set(false);
    const id = Number(valor);
    if (!valor || !/^[1-9]\d*$/.test(valor) || !Number.isSafeInteger(id)) {
      this.error.set('idInvalido');
      return of(null);
    }

    return this.noticiaService.obtenerPublicadaPorId(id).pipe(
      map((respuesta) => respuesta.data),
      catchError((error: HttpErrorResponse) => {
        this.error.set(error.status === 404 ? 'noEncontrada' : 'conexion');
        return of(null);
      }),
    );
  }
}

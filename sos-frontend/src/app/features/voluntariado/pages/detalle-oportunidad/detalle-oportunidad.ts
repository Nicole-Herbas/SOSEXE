import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { OportunidadVoluntariado } from '../../models/oportunidad-voluntariado';
import { VoluntariadoService } from '../../services/voluntariado.service';
import { FormularioPostulacion } from '../../components/formulario-postulacion/formulario-postulacion';

type ErrorDetalle = 'idInvalido' | 'noEncontrada' | 'errorCarga';

@Component({
  selector: 'app-detalle-oportunidad',
  standalone: true,
  imports: [RouterLink, FormularioPostulacion],
  templateUrl: './detalle-oportunidad.html',
  styleUrl: './detalle-oportunidad.scss',
})
export class DetalleOportunidad {
  readonly textos = APP_TEXTOS.voluntariado.oportunidades.detalle;
  readonly oportunidad = signal<OportunidadVoluntariado | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<ErrorDetalle | null>(null);
  readonly textosPostulacion = APP_TEXTOS.voluntariado.oportunidades.postulacion;
  readonly mostrarPostulacion = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(VoluntariadoService);
  private readonly reintentos = new Subject<void>();
  private readonly formatoFecha = new Intl.DateTimeFormat('es-BO', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });

  constructor() {
    this.route.paramMap.pipe(
      switchMap(params => this.reintentos.pipe(
        startWith(undefined),
        switchMap(() => this.consultar(params.get('id'))),
      )),
      takeUntilDestroyed(),
    ).subscribe(oportunidad => {
      this.oportunidad.set(oportunidad);
      this.cargando.set(false);
    });
  }

  reintentar(): void {
    this.reintentos.next();
  }

  datoInformado(valor: string | null | undefined): string {
    return valor?.trim() ? valor : this.textos.noInformado;
  }

  formatearFecha(valor: string | null | undefined): string | null {
    if (!valor?.trim()) return null;
    // El DTO contiene fecha y hora local, sin zona. Se interpreta y presenta en hora local.
    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? null : this.formatoFecha.format(fecha);
  }

  private consultar(id: string | null): Observable<OportunidadVoluntariado | null> {
    this.mostrarPostulacion.set(false);
    this.oportunidad.set(null);
    this.error.set(null);
    this.cargando.set(true);

    if (!id || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
      this.error.set('idInvalido');
      return of(null);
    }

    return this.service.obtenerPublicadaPorId(Number(id)).pipe(
      map(respuesta => respuesta.data),
      catchError((error: HttpErrorResponse) => {
        this.error.set(error.status === 404 ? 'noEncontrada' : 'errorCarga');
        return of(null);
      }),
    );
  }
}

import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { Alerta } from '../../models/alerta.model';
import { AlertaService } from '../../services/alerta.service';

@Component({
  selector: 'app-revisar-alertas',
  imports: [DatePipe, RouterLink],
  templateUrl: './revisar-alertas.html',
  styleUrl: './revisar-alertas.scss',
})
export class RevisarAlertasComponent implements OnInit {
  private readonly servicio = inject(AlertaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly encabezado = viewChild<ElementRef<HTMLElement>>('encabezado');
  readonly textos = APP_TEXTOS.alertas;
  readonly borradores = signal<Alerta[]>([]);
  readonly alerta = signal<Alerta | null>(null);
  readonly cargando = signal(false);
  readonly cargandoRevision = signal(false);
  readonly publicando = signal(false);
  readonly confirmado = signal(false);
  readonly requiereRecarga = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal(false);

  constructor() {
    effect(() => this.encabezado()?.nativeElement.focus());
  }

  ngOnInit(): void {
    this.cargarBorradores();
  }

  cargarBorradores(): void {
    if (this.cargando() || this.publicando()) return;
    this.error.set(null);
    this.cargando.set(true);
    this.servicio
      .borradores()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (respuesta) => {
          if (!respuesta.success || !respuesta.data) {
            this.error.set(this.textos.errorBorradores);
            return;
          }
          this.borradores.set(respuesta.data);
        },
        error: () => this.error.set(this.textos.errorBorradores),
      });
  }

  revisar(id: number): void {
    if (this.cargandoRevision() || this.publicando()) return;
    this.error.set(null);
    this.exito.set(false);
    this.confirmado.set(false);
    this.requiereRecarga.set(true);
    this.cargandoRevision.set(true);
    this.servicio
      .revisar(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoRevision.set(false)),
      )
      .subscribe({
        next: (respuesta) => {
          if (!respuesta.success || !respuesta.data) {
            this.error.set(this.textos.errorRevision);
            return;
          }
          this.alerta.set(respuesta.data);
          this.requiereRecarga.set(false);
        },
        error: () => this.error.set(this.textos.errorRevision),
      });
  }

  volver(): void {
    if (this.publicando() || this.cargandoRevision()) return;
    this.alerta.set(null);
    this.confirmado.set(false);
    this.exito.set(false);
    this.error.set(null);
    this.cargarBorradores();
  }

  publicar(): void {
    const alerta = this.alerta();
    if (
      !alerta ||
      alerta.estado !== 'BORRADOR' ||
      !this.confirmado() ||
      this.publicando() ||
      this.cargandoRevision() ||
      this.requiereRecarga()
    )
      return;

    this.publicando.set(true);
    this.error.set(null);
    this.servicio
      .publicar(alerta.id, alerta.version)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.publicando.set(false)),
      )
      .subscribe({
        next: (respuesta) => {
          if (!respuesta.success || respuesta.data?.estado !== 'ACTIVA') {
            this.falloPublicacion(this.textos.errorPublicar);
            return;
          }
          this.alerta.set(respuesta.data);
          this.borradores.update((borradores) =>
            borradores.filter((item) => item.id !== alerta.id),
          );
          this.confirmado.set(false);
          this.exito.set(true);
        },
        error: (error: HttpErrorResponse) => {
          const mensaje: unknown = error.error?.message;
          this.falloPublicacion(
            error.status === 409
              ? this.textos.errorCambio
              : typeof mensaje === 'string'
                ? mensaje
                : this.textos.errorPublicar,
          );
        },
      });
  }

  private falloPublicacion(mensaje: string): void {
    this.error.set(mensaje);
    this.confirmado.set(false);
    // Un fallo de red puede llegar después del commit: volver a consultar antes de reintentar.
    this.requiereRecarga.set(true);
  }
}

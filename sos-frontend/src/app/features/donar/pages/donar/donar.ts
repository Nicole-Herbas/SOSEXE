import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { Centro } from '../../../centros/models/centro';
import { CentroService } from '../../../centros/services/centro';
@Component({
  selector: 'app-donar',
  imports: [RouterLink],
  templateUrl: './donar.html',
  styleUrl: './donar.scss',
})
export class Donar implements OnInit {
  readonly textos = APP_TEXTOS.donar;

  private readonly centroService = inject(CentroService);
  private readonly destroyRef = inject(DestroyRef);

  readonly centros = signal<Centro[]>([]);
  readonly centroSeleccionado = signal<Centro | null>(null);

  readonly cargando = signal(true);
  readonly errorCarga = signal(false);
  readonly seleccionConfirmada = signal(false);

  ngOnInit(): void {
    this.cargarCentros();
  }

  cargarCentros(): void {
    this.cargando.set(true);
    this.errorCarga.set(false);

    this.centroService.listarVerificados()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: centros => {
          this.centros.set(centros);
          this.cargando.set(false);
        },
        error: () => {
          this.centros.set([]);
          this.cargando.set(false);
          this.errorCarga.set(true);
        }
      });
  }

  seleccionarCentro(centro: Centro): void {
    this.centroSeleccionado.set(centro);
    this.seleccionConfirmada.set(false);
  }

  confirmarSeleccion(): void {
    if (!this.centroSeleccionado()) {
      return;
    }

    this.seleccionConfirmada.set(true);
  }

  ubicacion(centro: Centro): string {
    return [centro.ciudad, centro.departamentoNombre]
      .filter(Boolean)
      .join(', ') || this.textos.ubicacionNoDisponible;
  }
}

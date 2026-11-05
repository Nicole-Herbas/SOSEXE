import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { IdiomaService } from '../../../../shared/services/idioma.service';
import { Centro } from '../../../centros/models/centro';
import { CentroService } from '../../../centros/services/centro';
import { MONTO_MINIMO_CENTAVOS, MONTOS_DONACION_CENTAVOS, convertirMontoACentavos } from '../../constants/montos-donacion.constants';
@Component({
  selector: 'app-donar',
  imports: [RouterLink],
  templateUrl: './donar.html',
  styleUrl: './donar.scss',
})
export class Donar implements OnInit {
  private readonly centroService = inject(CentroService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly idiomaService = inject(IdiomaService);

  readonly t = computed(() => {
    this.idiomaService.traducciones$();
    return (clave: string) => this.idiomaService.t(`donar.${clave}`);
  });
  readonly pasos = ['centro', 'monto', 'pago', 'confirmacion'] as const;
  readonly montos = MONTOS_DONACION_CENTAVOS;
  readonly pasoActual = signal<1 | 2 | 3>(1);
  readonly montoPredefinido = signal<number | null>(null);
  readonly montoPersonalizado = signal('');
  readonly usarMontoPersonalizado = signal(false);
  readonly anonima = signal(false);
  readonly montoCentavos = computed(() => this.usarMontoPersonalizado()
    ? convertirMontoACentavos(this.montoPersonalizado())
    : this.montoPredefinido());
  readonly montoValido = computed(() => {
    const monto = this.montoCentavos();
    return monto !== null && monto >= MONTO_MINIMO_CENTAVOS;
  });
  readonly errorMonto = computed(() => {
    if (!this.usarMontoPersonalizado()) return '';
    if (!this.montoPersonalizado().trim()) return 'errorMontoVacio';
    const monto = this.montoCentavos();
    return monto === null ? 'errorFormatoMonto' : monto < MONTO_MINIMO_CENTAVOS ? 'errorMinimoMonto' : '';
  });

  readonly centros = signal<Centro[]>([]);
  readonly centroSeleccionado = signal<Centro | null>(null);

  readonly cargando = signal(true);
  readonly errorCarga = signal(false);

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
          if (this.centroSeleccionado() && !centros.some(centro => centro.id === this.centroSeleccionado()?.id)) {
            this.centroSeleccionado.set(null);
            this.pasoActual.set(1);
          }
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
  }

  confirmarSeleccion(): void {
    if (this.centroSeleccionado() && this.centros().some(centro => centro.id === this.centroSeleccionado()?.id)) {
      this.pasoActual.set(2);
    }
  }

  seleccionarMonto(monto: number): void {
    this.usarMontoPersonalizado.set(false);
    this.montoPredefinido.set(monto);
  }

  actualizarMontoPersonalizado(valor: string): void {
    this.usarMontoPersonalizado.set(true);
    this.montoPersonalizado.set(valor);
  }

  continuar(): void {
    if (this.pasoActual() === 2 && this.centroSeleccionado() && this.montoValido()) {
      this.pasoActual.set(3);
    }
  }

  atras(): void {
    if (this.pasoActual() > 1) this.pasoActual.set(this.pasoActual() === 3 ? 2 : 1);
  }

  formatearMonto(centavos: number | null): string {
    const idioma = this.idiomaService.idioma$() === 'en' ? 'en-US' : 'es-BO';
    return centavos === null ? '—' : `Bs ${new Intl.NumberFormat(idioma, { maximumFractionDigits: 2, minimumFractionDigits: centavos % 100 ? 2 : 0 }).format(centavos / 100)}`;
  }

  ubicacion(centro: Centro): string {
    return [centro.ciudad, centro.departamentoNombre]
      .filter(Boolean)
      .join(', ') || this.t()('ubicacionNoDisponible');
  }
}

import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { IdiomaService } from '../services/idioma.service';

/**
 * SOS-114 — Pipe de traducción reactiva.
 *
 * Convierte una clave dot-notation en el texto traducido al idioma activo.
 * Se actualiza automáticamente cuando el usuario cambia el idioma.
 *
 * Uso en templates:
 * ```html
 * {{ 'navbar.lema' | translate }}
 * {{ 'inicio.hero.titulo' | translate }}
 * ```
 *
 * Pure = false: Angular re-evalúa el pipe en cada ciclo de detección de cambios,
 * lo que garantiza que los textos se actualicen cuando cambia el idioma.
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform, OnDestroy {

  private readonly idiomaService = inject(IdiomaService);
  private readonly cdr = inject(ChangeDetectorRef);

  private ultimaClave = '';
  private ultimoResultado = '';

  transform(clave: string): string {
    if (!clave) return '';

    const resultado = this.idiomaService.t(clave);

    // Invalidar la vista cuando el texto cambia (idioma fue actualizado)
    if (resultado !== this.ultimoResultado || clave !== this.ultimaClave) {
      this.ultimaClave = clave;
      this.ultimoResultado = resultado;
      this.cdr.markForCheck();
    }

    return resultado;
  }

  ngOnDestroy(): void {
    // Cleanup si fuera necesario en el futuro
  }
}

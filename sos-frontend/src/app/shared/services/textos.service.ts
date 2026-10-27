import { Injectable, inject } from '@angular/core';
import { IdiomaService } from './idioma.service';

/**
 * SOS-114 — Facade de texto internacionalizado.
 *
 * Envuelve `IdiomaService` con un método `t()` de acceso directo
 * que puede inyectarse en cualquier componente o servicio.
 *
 * Uso en componentes:
 * ```ts
 * private textos = inject(TextosService);
 * titulo = computed(() => this.textos.t('preferencias.titulo'));
 * ```
 *
 * Los componentes no migrados pueden seguir usando `APP_TEXTOS` sin cambios.
 */
@Injectable({ providedIn: 'root' })
export class TextosService {

  private readonly idioma = inject(IdiomaService);

  /**
   * Devuelve el texto traducido al idioma activo.
   * Si la clave no existe en las traducciones, retorna la clave como fallback.
   */
  t(clave: string): string {
    return this.idioma.t(clave);
  }

  /** Señal con el idioma activo ('es' | 'en'). */
  get idioma$() {
    return this.idioma.idioma$;
  }

  /** Señal con el mapa completo de traducciones. */
  get traducciones$() {
    return this.idioma.traducciones$;
  }
}

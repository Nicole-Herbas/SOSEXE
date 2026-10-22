import {
  Injectable,
  signal,
  effect,
  inject
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** Idiomas soportados por SOS.exe */
export type Idioma = 'es' | 'en';

/**
 * SOS-114 — Servicio de idioma / i18n.
 *
 * Gestiona el idioma activo de la aplicación y carga los archivos de
 * traducción desde `public/i18n/<idioma>.json` (generados por Loco).
 *
 * El idioma se persiste en `localStorage` bajo la clave `idioma_preferido`.
 * El cambio de idioma es reactivo: cualquier componente que lea
 * `traducciones$` se actualiza automáticamente sin necesidad de recargar.
 *
 * Uso en componentes:
 * ```ts
 * private idiomaService = inject(IdiomaService);
 * texto = computed(() => this.idiomaService.t('navbar.lema'));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class IdiomaService {

  private readonly STORAGE_KEY = 'idioma_preferido';
  private readonly http = inject(HttpClient);

  private readonly _idioma = signal<Idioma>(
    this.obtenerIdiomaGuardado()
  );

  /** Señal de solo-lectura con el idioma activo ('es' | 'en'). */
  readonly idioma$ = this._idioma.asReadonly();

  private readonly _traducciones = signal<Record<string, string>>({});

  /** Señal con el mapa de traducciones del idioma activo. */
  readonly traducciones$ = this._traducciones.asReadonly();

  constructor() {
    // Carga traducciones cada vez que cambia el idioma.
    effect(() => {
      const idioma = this._idioma();
      this.cargarTraducciones(idioma);
    });
  }

  /**
   * Cambia el idioma activo y lo persiste en localStorage.
   * La carga del archivo de traducciones se dispara automáticamente.
   */
  setIdioma(idioma: Idioma): void {
    localStorage.setItem(this.STORAGE_KEY, idioma);
    this._idioma.set(idioma);
  }

  /**
   * Devuelve el texto traducido para la clave dada.
   * Si la clave no existe en el archivo de traducciones, retorna la clave misma
   * como fallback (nunca lanza error ni devuelve cadena vacía).
   */
  t(clave: string): string {
    return this._traducciones()[clave] ?? clave;
  }

  // ── Privado ──────────────────────────────────────────────────────────────

  private obtenerIdiomaGuardado(): Idioma {
    const guardado = localStorage.getItem(this.STORAGE_KEY);
    return (guardado === 'es' || guardado === 'en') ? guardado : 'es';
  }

  private cargarTraducciones(idioma: Idioma): void {
    this.http
      .get<Record<string, string>>(`/i18n/${idioma}.json`)
      .subscribe({
        next:  t   => this._traducciones.set(t),
        error: err => console.error(`[IdiomaService] No se pudo cargar ${idioma}.json`, err),
      });
  }
}

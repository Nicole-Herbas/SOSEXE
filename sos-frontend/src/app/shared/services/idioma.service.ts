import {
  Injectable,
  signal,
  inject
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_TEXTOS } from '../constants/app-textos.constants';

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
    this.cargarTraducciones(this._idioma());
  }

  /**
   * Cambia el idioma activo y lo persiste en localStorage.
   * La carga del archivo de traducciones se dispara inmediatamente.
   */
  setIdioma(idioma: Idioma): void {
    localStorage.setItem(this.STORAGE_KEY, idioma);
    this._idioma.set(idioma);
    this.cargarTraducciones(idioma);
  }

  /**
   * Devuelve el texto traducido para la clave dada.
   * Si la clave no existe en el archivo de traducciones cargado,
   * consulta APP_TEXTOS como fallback y finalmente retorna la clave misma.
   */
  t(clave: string): string {
    return this._traducciones()[clave] ?? this.obtenerDeConstante(clave) ?? clave;
  }

  // ── Privado ──────────────────────────────────────────────────────────────

  private obtenerIdiomaGuardado(): Idioma {
    const guardado = localStorage.getItem(this.STORAGE_KEY);
    return (guardado === 'es' || guardado === 'en') ? guardado : 'es';
  }

  private cargarTraducciones(idioma: Idioma): void {
    this.http
      .get<any>(`/i18n/${idioma}.json`)
      .subscribe({
        next:  t   => this._traducciones.set(this.aplanar(t)),
        error: ()  => {
          // Fallback seguro si falla la carga en tests o entornos sin servidor
        },
      });
  }

  private aplanar(obj: any, prefijo = ''): Record<string, string> {
    const res: Record<string, string> = {};
    if (!obj || typeof obj !== 'object') return res;
    for (const k of Object.keys(obj)) {
      const val = obj[k];
      const clave = prefijo ? `${prefijo}.${k}` : k;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        Object.assign(res, this.aplanar(val, clave));
      } else {
        res[clave] = String(val);
      }
    }
    return res;
  }

  private obtenerDeConstante(clave: string): string | undefined {
    const partes = clave.split('.');
    let curr: any = APP_TEXTOS;
    for (const p of partes) {
      if (curr == null || typeof curr !== 'object') return undefined;
      curr = curr[p];
    }
    return typeof curr === 'string' ? curr : undefined;
  }
}

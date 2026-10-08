/**
 * Feature Toggles — configuración centralizada de funcionalidades.
 *
 * Cómo usarlo:
 *   import { FEATURE_TOGGLES } from '@shared/config/feature-toggles';
 *
 * Cómo agregar un nuevo toggle:
 *   1. Agrega la propiedad en la sección del feature correspondiente.
 *   2. Si es una nueva página/módulo, crea una nueva sección con comentario.
 *   3. Documentá el toggle con JSDoc indicando qué hace true y qué hace false.
 */

// ---------------------------------------------------------------------------
// 🗺️  Módulo: Mapa
// ---------------------------------------------------------------------------
export interface MapaToggles {
  /** true  → consume /api/mapa/puntos del backend
   *  false → usa PUNTOS_MAPA_FALLBACK (datos estáticos de mapa.constants.ts) */
  usarBackend: boolean;

  /** true  → muestra el panel lateral derecho con el detalle del punto seleccionado
   *  false → oculta el panel; el mapa funciona solo con la lista */
  mostrarDetalle: boolean;

  /** true  → habilita y muestra los filtros de tipo y necesidad
   *  false → oculta los filtros y devuelve todos los puntos sin filtrar */
  filtros: boolean;

  /** true  → muestra la columna izquierda con la lista de centros y buscador
   *  false → oculta completamente la lista; solo se ve el mapa */
  mostrarLista: boolean;

  /** true  → muestra el componente de mapa Leaflet con los marcadores
   *  false → oculta completamente el mapa; solo se ve la lista de centros */
  mostrarMapa: boolean;
}

// ---------------------------------------------------------------------------
// 📰 Módulo: Noticias
// ---------------------------------------------------------------------------
export interface NoticiasToggles {
  /** true → muestra la alerta estática de referencia; false → la oculta */
  mostrarAlertas: boolean;

  /** true → habilita filtros por categoría en /noticias */
  mostrarFiltros: boolean;

  /** true → consulta y muestra noticias externas */
  mostrarExternas: boolean;

  /** true → consulta y muestra noticias propias publicadas */
  mostrarPropias: boolean;
}

// ---------------------------------------------------------------------------
// 🏠 Módulo: Inicio
// ---------------------------------------------------------------------------
export interface InicioToggles {
  /** true → muestra la sección de noticias en /inicio */
  mostrarSeccionNoticias: boolean;

  /** true → muestra filtros de categoría en /inicio */
  mostrarFiltrosNoticias: boolean;

  /** true → consulta y muestra noticias externas en /inicio */
  mostrarNoticiasExternas: boolean;

  /** true → consulta y muestra noticias propias en /inicio */
  mostrarNoticiasPropias: boolean;
}

// ---------------------------------------------------------------------------
// 📦 Interfaz raíz — agregar aquí nuevos módulos en el futuro
// ---------------------------------------------------------------------------
export interface FeatureToggles {
  mapa: MapaToggles;
  noticias: NoticiasToggles;
  inicio: InicioToggles;
  // donaciones: DonacionesToggles;
}

// ---------------------------------------------------------------------------
// ⚙️  Valores activos — modificar aquí para habilitar o deshabilitar
// ---------------------------------------------------------------------------
export const FEATURE_TOGGLES: FeatureToggles = {

  mapa: {
    usarBackend:    true,
    mostrarDetalle: true,
    filtros:        true,
    mostrarLista:   true,
    mostrarMapa:    true,
  },

  noticias: {
    mostrarAlertas: true,
    mostrarFiltros: true,
    mostrarExternas: true,
    mostrarPropias: true,
  },

  inicio: {
    mostrarSeccionNoticias: true,
    mostrarFiltrosNoticias: true,
    mostrarNoticiasExternas: true,
    mostrarNoticiasPropias: true,
  },

};

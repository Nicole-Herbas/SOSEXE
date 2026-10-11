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
// 🤝 Módulo: Voluntariado
// ---------------------------------------------------------------------------
export interface VoluntariadoToggles {
  /** true  → muestra la sección "Oportunidades disponibles" con las tarjetas
   *  false → oculta la sección completa */
  mostrarSeccionOportunidades: boolean;

  /** true  → muestra la sección "¿Cómo funciona?" con los 3 pasos
   *  false → oculta la sección */
  mostrarSeccionComoFunciona: boolean;

  /** true  → muestra el badge de cupos disponibles en cada tarjeta
   *  false → oculta los badges de cupos (útil si aún no hay datos reales) */
  mostrarCupos: boolean;

  /** true  → habilita el flujo de crear/editar perfil de voluntario (SOS-40)
   *  false → oculta el formulario de perfil y la tarjeta */
  mostrarPerfilVoluntario: boolean;
}

// ---------------------------------------------------------------------------
// ℹ️  Módulo: Acerca de
// ---------------------------------------------------------------------------
export interface AcercaDeToggles {
  /** true  → muestra la sección "¿Cómo verificamos los centros?" con los 4 pasos
   *  false → oculta la sección de verificación */
  mostrarSeccionVerificacion: boolean;

  /** true  → muestra la sección "Nuestros valores" con las 4 tarjetas
   *  false → oculta la sección de valores */
  mostrarSeccionValores: boolean;

  /** true  → muestra la sección "Una plataforma para ayudar" con los 3 roles
   *  false → oculta la sección de roles */
  mostrarSeccionRoles: boolean;
}

// ---------------------------------------------------------------------------
// 📦 Interfaz raíz — agregar aquí nuevos módulos en el futuro
// ---------------------------------------------------------------------------
export interface FeatureToggles {
  mapa: MapaToggles;
  noticias: NoticiasToggles;
  inicio: InicioToggles;
  voluntariado: VoluntariadoToggles;
  acercaDe: AcercaDeToggles;
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

  voluntariado: {
    mostrarSeccionOportunidades: true,
    mostrarSeccionComoFunciona:  true,
    mostrarCupos:                true,
    mostrarPerfilVoluntario:     true,
  },

  acercaDe: {
    mostrarSeccionVerificacion: true,
    mostrarSeccionValores:      true,
    mostrarSeccionRoles:        true,
  },

};

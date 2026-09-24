export const FEATURE_TOGGLES = {

  /** true = datos del API backend, false = datos hardcodeados de constantes */
  mapaUsarBackend: true,

  /** true = mostrar panel derecho con detalle del punto seleccionado */
  mapaMostrarDetalle: true,

  /** true = habilitar filtros funcionales de tipo y necesidad */
  mapaFiltros: true,

} as const;

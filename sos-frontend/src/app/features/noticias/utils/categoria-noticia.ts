import { APP_TEXTOS } from '../../../shared/constants/app-textos.constants';
import { Noticia } from '../models/noticia.model';

export const CATEGORIAS_NOTICIAS = APP_TEXTOS.noticias.filtros;

const MAPEO_CATEGORIAS_EXTERNAS: Record<string, string> = {
  fire: 'Incendios',
  fires: 'Incendios',
  wildfire: 'Incendios',
  wildfires: 'Incendios',
  'forest fire': 'Incendios',
  'forest fires': 'Incendios',
  incendio: 'Incendios',
  incendios: 'Incendios',
  flood: 'Inundaciones',
  floods: 'Inundaciones',
  flooding: 'Inundaciones',
  inundacion: 'Inundaciones',
  inundaciones: 'Inundaciones',
  landslide: 'Deslizamientos',
  landslides: 'Deslizamientos',
  mudslide: 'Deslizamientos',
  deslizamiento: 'Deslizamientos',
  deslizamientos: 'Deslizamientos',
  drought: 'Sequías',
  droughts: 'Sequías',
  sequia: 'Sequías',
  sequias: 'Sequías',
  community: 'Comunidad',
  humanitarian: 'Comunidad',
  'humanitarian aid': 'Comunidad',
  relief: 'Comunidad',
  volunteer: 'Comunidad',
  volunteers: 'Comunidad',
  alert: 'Alertas',
  alerts: 'Alertas',
  warning: 'Alertas',
  warnings: 'Alertas',
};

export function normalizarTextoCategoria(categoria: string): string {
  return categoria
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es');
}

const CLAVES_CATEGORIA = [
  'todas',
  'incendios',
  'inundaciones',
  'deslizamientos',
  'sequias',
  'comunidad',
  'alertas',
  'otras',
];

/**
 * Devuelve la clave i18n con la que se muestra una categoría. El valor de la
 * categoría (en español) sigue siendo el que se usa para filtrar; esta clave
 * solo sirve para traducir la etiqueta visible. Si la categoría no es una de
 * las conocidas, se devuelve tal cual para mostrarla sin traducir.
 */
export function claveTraduccionCategoria(categoria: string | null | undefined): string {
  const original = categoria ?? '';
  const normalizada = normalizarTextoCategoria(original);
  return CLAVES_CATEGORIA.includes(normalizada)
    ? `noticias.categorias.${normalizada}`
    : original;
}

export function normalizarCategoriaExterna(categoria: string | null): string {
  const normalizada = normalizarTextoCategoria(categoria ?? '');
  const categoriaConocida = CATEGORIAS_NOTICIAS.find(
    (opcion) => normalizarTextoCategoria(opcion) === normalizada,
  );

  return (
    categoriaConocida ??
    MAPEO_CATEGORIAS_EXTERNAS[normalizada] ??
    APP_TEXTOS.noticias.categoriaOtras
  );
}

export function crearNoticiaAlertaReferencia(): Noticia {
  const textos = APP_TEXTOS.noticias;
  return {
    id: 'alerta-referencia',
    titulo: textos.alertaTituloReferencia,
    resumen: textos.alertaMensajeReferencia,
    imagenUrl: null,
    fuente: 'SOS.exe',
    categoria: CATEGORIAS_NOTICIAS.find(
      (categoria) => normalizarTextoCategoria(categoria) === 'alertas',
    ) ?? 'Alertas',
    ubicacion: textos.alertaUbicacionReferencia,
    fechaPublicacion: null,
    esExterna: false,
  };
}

export function filtrarNoticiasPorCategoria(
  noticias: Noticia[],
  filtro: string,
): Noticia[] {
  if (normalizarTextoCategoria(filtro) === normalizarTextoCategoria(APP_TEXTOS.noticias.filtroTodas)) {
    return noticias;
  }

  const normalizada = normalizarTextoCategoria(filtro);
  const coincidencias = noticias.filter(
    (noticia) => normalizarTextoCategoria(noticia.categoria) === normalizada,
  );

  if (normalizada !== 'alertas') {
    return coincidencias;
  }

  return [
    crearNoticiaAlertaReferencia(),
    ...coincidencias.filter((noticia) => noticia.id !== 'alerta-referencia'),
  ];
}
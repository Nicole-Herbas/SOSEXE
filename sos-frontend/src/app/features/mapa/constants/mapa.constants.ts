import {
  APP_TEXTOS
} from '../../../shared/constants/app-textos.constants';


export const FILTROS_TIPO_MAPA = [
  {
    id: 'todos',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.todos,
    color: ''
  },
  {
    id: 'CENTRO_APOYO',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.centroApoyo,
    color: 'azul'
  },
  {
    id: 'REFUGIO',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.refugio,
    color: 'verde'
  },
  {
    id: 'PUNTO_DONACION',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.puntoDonacion,
    color: 'amarillo'
  },
  {
    id: 'EMERGENCIA',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.emergencia,
    color: 'rojo'
  },
] as const;


export const FILTROS_NECESIDAD_MAPA = [
  {
    id: 'todas',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.todas
  },
  {
    id: 'Agua',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.agua
  },
  {
    id: 'Alimentos',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.alimentos
  },
  {
    id: 'Medicamentos',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.medicamentos
  },
  {
    id: 'Ropa',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.ropa
  },
  {
    id: 'Herramientas',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.herramientas
  },
  {
    id: 'Voluntarios',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.voluntarios
  },
] as const;


/**
 * Mapeo de tipo de backend a clase CSS para el color del tag.
 */
export const TIPO_CLASE_MAPA: Record<string, string> = {
  CENTRO_APOYO: '',
  REFUGIO: 'refugio',
  PUNTO_DONACION: 'donacion',
  EMERGENCIA: 'emergencia',
};


export const TIPO_ETIQUETA_MAPA: Record<string, string> = {
  CENTRO_APOYO:
    APP_TEXTOS.mapa.tipos.centroApoyo,

  REFUGIO:
    APP_TEXTOS.mapa.tipos.refugio,

  PUNTO_DONACION:
    APP_TEXTOS.mapa.tipos.puntoDonacion,

  EMERGENCIA:
    APP_TEXTOS.mapa.tipos.emergencia,
};


/**
 * Datos estáticos de fallback
 * usados cuando feature toggle mapaUsarBackend = false.
 */
export const PUNTOS_MAPA_FALLBACK = [
  {
    id: 0,

    origen:
      'CENTRO' as const,

    tipo:
      'CENTRO_APOYO',

    nombre:
      'Centro de Apoyo San José',

    ciudad:
      'Cochabamba',

    departamentoNombre:
      'Cochabamba',

    descripcion:
      'Centro comunitario de recepción y distribución de ayuda para familias afectadas.',

    direccion:
      'Av. Blanco Galindo, zona oeste',

    telefono:
      '+591 70700001',

    latitud:
      -17.3895,

    longitud:
      -66.1568,

    estadoVerificacion:
      'VERIFICADO',

    necesidades: [
      'Agua',
      'Alimentos',
      'Medicamentos'
    ],
  },

  {
    id: 1,

    origen:
      'CENTRO' as const,

    tipo:
      'CENTRO_APOYO',

    nombre:
      'Centro Comunitario La Paz',

    ciudad:
      'La Paz',

    departamentoNombre:
      'La Paz',

    descripcion:
      'Centro de apoyo comunitario.',

    direccion:
      'Zona Central',

    telefono:
      '+591 70700002',

    latitud:
      -16.4897,

    longitud:
      -68.1193,

    estadoVerificacion:
      'VERIFICADO',

    necesidades: [
      'Ropa',
      'Voluntarios'
    ],
  },

  {
    id: 2,

    origen:
      'PUNTO_AYUDA' as const,

    tipo:
      'REFUGIO',

    nombre:
      'Refugio Temporal Santa Cruz',

    ciudad:
      'Santa Cruz',

    departamentoNombre:
      'Santa Cruz',

    descripcion:
      'Refugio temporal para familias desplazadas.',

    direccion:
      'Av. Cristo Redentor',

    latitud:
      -17.7833,

    longitud:
      -63.1821,

    estadoVerificacion:
      'PENDIENTE',

    necesidades: [
      'Agua',
      'Ropa'
    ],
  },
];

export const DEPARTAMENTOS_BOLIVIA = [
  { id: 'todos', etiqueta: 'Todos los departamentos' },
  { id: 'La Paz', etiqueta: 'La Paz' },
  { id: 'Cochabamba', etiqueta: 'Cochabamba' },
  { id: 'Santa Cruz', etiqueta: 'Santa Cruz' },
  { id: 'Oruro', etiqueta: 'Oruro' },
  { id: 'Potosí', etiqueta: 'Potosí' },
  { id: 'Chuquisaca', etiqueta: 'Chuquisaca' },
  { id: 'Tarija', etiqueta: 'Tarija' },
  { id: 'Beni', etiqueta: 'Beni' },
  { id: 'Pando', etiqueta: 'Pando' },
] as const;
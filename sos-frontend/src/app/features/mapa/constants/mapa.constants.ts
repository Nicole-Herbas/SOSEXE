import {
  APP_TEXTOS
} from '../../../shared/constants/app-textos.constants';


export const FILTROS_TIPO_MAPA = [
  {
    id: 'todos',
    clave: 'mapa.filtrosTipo.todos',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.todos,
    color: ''
  },
  {
    id: 'CENTRO_APOYO',
    clave: 'mapa.filtrosTipo.centroApoyo',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.centroApoyo,
    color: 'azul'
  },
  {
    id: 'REFUGIO',
    clave: 'mapa.filtrosTipo.refugio',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.refugio,
    color: 'verde'
  },
  {
    id: 'PUNTO_DONACION',
    clave: 'mapa.filtrosTipo.puntoDonacion',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.puntoDonacion,
    color: 'amarillo'
  },
  {
    id: 'EMERGENCIA',
    clave: 'mapa.filtrosTipo.emergencia',
    etiqueta: APP_TEXTOS.mapa.filtrosTipo.emergencia,
    color: 'rojo'
  },
] as const;


export const FILTROS_NECESIDAD_MAPA = [
  {
    id: 'todas',
    clave: 'mapa.filtrosNecesidad.todas',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.todas
  },
  {
    id: 'Agua',
    clave: 'mapa.filtrosNecesidad.agua',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.agua
  },
  {
    id: 'Alimentos',
    clave: 'mapa.filtrosNecesidad.alimentos',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.alimentos
  },
  {
    id: 'Medicamentos',
    clave: 'mapa.filtrosNecesidad.medicamentos',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.medicamentos
  },
  {
    id: 'Ropa',
    clave: 'mapa.filtrosNecesidad.ropa',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.ropa
  },
  {
    id: 'Herramientas',
    clave: 'mapa.filtrosNecesidad.herramientas',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.herramientas
  },
  {
    id: 'Voluntarios',
    clave: 'mapa.filtrosNecesidad.voluntarios',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.voluntarios
  },
  {
    id: 'Higiene',
    clave: 'mapa.filtrosNecesidad.higiene',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.higiene
  },
  {
    id: 'Primeros auxilios',
    clave: 'mapa.filtrosNecesidad.primerosAuxilios',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.primerosAuxilios
  },
  {
    id: 'Alojamiento',
    clave: 'mapa.filtrosNecesidad.alojamiento',
    etiqueta: APP_TEXTOS.mapa.filtrosNecesidad.alojamiento
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

export const TIPO_CLAVE_MAPA: Record<string, string> = {
  CENTRO_APOYO: 'mapa.tipos.centroApoyo',
  REFUGIO: 'mapa.tipos.refugio',
  PUNTO_DONACION: 'mapa.tipos.puntoDonacion',
  EMERGENCIA: 'mapa.tipos.emergencia',
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

export const MAPA_TEXTOS = {
  subtitulo: 'Ayuda cerca de ti',
  titulo: 'Mapa de ayuda y emergencias',
  descripcion:
    'Encuentra centros, refugios, puntos de donación y emergencias. Filtra también por los artículos que necesitas entregar.',
  buscarEtiqueta: 'Buscar por ciudad o nombre',
  buscarPlaceholder: 'Ej.: Cochabamba o San José',
  necesidadesEtiqueta: '¿Qué deseas donar o encontrar?',
  resultadosTitulo: 'Resultados',
  verificado: '✓ Verificado',
  verificacionPendiente: 'Verificación pendiente',
  sinResultados: 'No se encontraron puntos con los filtros seleccionados.',
  cargando: 'Cargando puntos del mapa…',
  errorCarga: 'No se pudieron cargar los puntos. Intenta de nuevo.',
  mensajeMapa: 'Mapa interactivo · Implementado con Leaflet',
} as const;

export const MAPA_DETALLE_ETIQUETAS = {
  direccionEtiqueta: 'DIRECCIÓN',
  horarioEtiqueta: 'HORARIO O ESTADO',
  contactoEtiqueta: 'CONTACTO',
  necesidadesEtiqueta: 'NECESIDADES PRIORITARIAS',
  donacionesEtiqueta: 'DONACIONES QUE ACEPTA',
  comoLlegar: 'Cómo llegar',
  verCentro: 'Ver centro',
  reportar: 'Reportar información incorrecta',
  informacionVerificada: 'Información comprobada pendiente de revisión',
} as const;

export const FILTROS_TIPO_MAPA = [
  { id: 'todos', etiqueta: 'Todos', color: '' },
  { id: 'CENTRO_APOYO', etiqueta: 'Centros de apoyo', color: 'azul' },
  { id: 'REFUGIO', etiqueta: 'Refugios', color: 'verde' },
  { id: 'PUNTO_DONACION', etiqueta: 'Puntos de donación', color: 'amarillo' },
  { id: 'EMERGENCIA', etiqueta: 'Emergencias', color: 'rojo' },
] as const;

export const FILTROS_NECESIDAD_MAPA = [
  { id: 'todas', etiqueta: 'Todas' },
  { id: 'Agua', etiqueta: '💧 Agua' },
  { id: 'Alimentos', etiqueta: '◉ Alimentos' },
  { id: 'Medicamentos', etiqueta: '✦ Medicamentos' },
  { id: 'Ropa', etiqueta: '▭ Ropa' },
  { id: 'Herramientas', etiqueta: '✚ Herramientas' },
  { id: 'Voluntarios', etiqueta: '● Voluntarios' },
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

/**
 * Datos estáticos de fallback (usados cuando feature toggle mapaUsarBackend = false).
 */
export const PUNTOS_MAPA_FALLBACK = [
  {
    id: 0,
    origen: 'CENTRO' as const,
    tipo: 'CENTRO_APOYO',
    nombre: 'Centro de Apoyo San José',
    ciudad: 'Cochabamba',
    departamentoNombre: 'Cochabamba',
    descripcion: 'Centro comunitario de recepción y distribución de ayuda para familias afectadas.',
    direccion: 'Av. Blanco Galindo, zona oeste',
    telefono: '+591 70700001',
    latitud: -17.3895,
    longitud: -66.1568,
    estadoVerificacion: 'VERIFICADO',
    necesidades: ['Agua', 'Alimentos', 'Medicamentos'],
  },
  {
    id: 1,
    origen: 'CENTRO' as const,
    tipo: 'CENTRO_APOYO',
    nombre: 'Centro Comunitario La Paz',
    ciudad: 'La Paz',
    departamentoNombre: 'La Paz',
    descripcion: 'Centro de apoyo comunitario.',
    direccion: 'Zona Central',
    telefono: '+591 70700002',
    latitud: -16.4897,
    longitud: -68.1193,
    estadoVerificacion: 'VERIFICADO',
    necesidades: ['Ropa', 'Voluntarios'],
  },
  {
    id: 2,
    origen: 'PUNTO_AYUDA' as const,
    tipo: 'REFUGIO',
    nombre: 'Refugio Temporal Santa Cruz',
    ciudad: 'Santa Cruz',
    departamentoNombre: 'Santa Cruz',
    descripcion: 'Refugio temporal para familias desplazadas.',
    direccion: 'Av. Cristo Redentor',
    latitud: -17.7833,
    longitud: -63.1821,
    estadoVerificacion: 'PENDIENTE',
    necesidades: ['Agua', 'Ropa'],
  },
];

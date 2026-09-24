export const MAPA_TEXTOS = {
  subtitulo: 'Ayuda cerca de ti',
  titulo: 'Mapa de ayuda y emergencias',
  descripcion:
    'Encuentra centros, refugios, puntos de donación y emergencias. Filtra también por los artículos que necesitas entregar.',
  contadorVerificados: '7 puntos verificados en el prototipo',
  buscarEtiqueta: 'Buscar por ciudad o nombre',
  buscarPlaceholder: 'Ej.: Cochabamba o San José',
  necesidadesEtiqueta: '¿Qué deseas donar o encontrar?',
  resultadosTitulo: 'Resultados',
  resultadosCantidad: 8,
  verificado: '✓ Verificado',
  puntoVerificado: '✓ Punto verificado',
  mensajeMapa: 'Mapa interactivo · Implementado con Leaflet',
  detalle: {
    tipo: 'Centro de apoyo',
    nombre: 'Centro de Apoyo San José',
    ubicacion: 'Cochabamba, Cochabamba',
    descripcion:
      'Centro comunitario de recepción y distribución de ayuda para familias afectadas.',
    informacionVerificada: 'Información comprobada hace 3 días',
    direccionEtiqueta: 'Dirección',
    direccion: 'Av. Blanco Galindo, zona oeste',
    horarioEtiqueta: 'Horario o estado',
    horario: 'Lun–Sáb · 08:00–18:00',
    contactoEtiqueta: 'Contacto',
    contacto: '+591 70700001',
    prioridadesEtiqueta: 'Necesidades prioritarias',
    donacionesEtiqueta: 'Donaciones que acepta',
    comoLlegar: 'Cómo llegar',
    verCentro: 'Ver centro',
    reportar: 'Reportar información incorrecta',
  },
} as const;

export const FILTROS_TIPO_MAPA = [
  { id: 'todos', etiqueta: 'Todos', color: '' },
  { id: 'centros', etiqueta: 'Centros de apoyo', color: 'azul' },
  { id: 'refugios', etiqueta: 'Refugios', color: 'verde' },
  { id: 'donaciones', etiqueta: 'Puntos de donación', color: 'amarillo' },
  { id: 'emergencias', etiqueta: 'Emergencias', color: 'rojo' },
] as const;

export const FILTROS_NECESIDAD_MAPA = [
  { id: 'todas', etiqueta: 'Todas' },
  { id: 'agua', etiqueta: '💧 Agua' },
  { id: 'alimentos', etiqueta: '◉ Alimentos' },
  { id: 'higiene', etiqueta: '✦ Higiene' },
  { id: 'medicinas', etiqueta: '✚ Medicinas' },
] as const;

export const PUNTOS_MAPA = [
  {
    tipo: 'Centro de apoyo',
    nombre: 'Centro de Apoyo San José',
    ubicacion: 'Cochabamba · Cochabamba',
    necesidades: ['💧 Agua', '◉ Alimentos', '✚ Medicinas'],
    actualizado: 'Actualizado hace 3 días',
    seleccionado: true,
    claseTipo: '',
  },
  {
    tipo: 'Centro de apoyo',
    nombre: 'Centro Comunitario La Paz',
    ubicacion: 'La Paz · La Paz',
    necesidades: ['▭ Ropa', '✦ Higiene', '● Voluntarios'],
    actualizado: 'Actualizado hace 5 días',
    seleccionado: false,
    claseTipo: '',
  },
  {
    tipo: 'Refugio',
    nombre: 'Refugio Temporal Santa Cruz',
    ubicacion: 'Santa Cruz · Santa Cruz',
    necesidades: ['💧 Agua', '▭ Ropa'],
    actualizado: 'Actualizado recientemente',
    seleccionado: false,
    claseTipo: 'refugio',
  },
] as const;

export const NECESIDADES_PRIORITARIAS = [
  '💧 Agua',
  '◉ Alimentos',
  '✚ Medicinas',
] as const;

export const DONACIONES_ACEPTADAS = [
  '💧 Agua',
  '◉ Alimentos',
  '✦ Higiene',
  '✚ Medicinas',
  '▭ Ropa',
] as const;

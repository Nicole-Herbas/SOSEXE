/**
 * Strings del componente de Dashboard (Admin).
 * Centraliza todos los textos visibles para facilitar mantenimiento y futura i18n.
 */
export const DASHBOARD_STRINGS = {
  // Sidebar
  logoTag:       'SOS.exe',
  sidebarTitulo: 'Panel Admin',
  navDashboard:  'Dashboard',
  navCentros:    'Centros',
  navNoticias:   'Noticias',
  navVoluntariado: 'Voluntariado',
  navMapa:       'Mapa',
  botonLogout:   'Cerrar sesión',

  // Header
  bienvenida:    'Bienvenido,',
  subtituloHeader: 'Panel de administración de SOS.exe',

  // Stats
  statCentros:    'Centros activos',
  statUsuarios:   'Usuarios registrados',
  statPostulaciones: 'Postulaciones',
  statDonaciones: 'Donaciones',
  valorPendiente: '—',

  // Quick access
  tituloAccesoRapido: 'Acceso rápido',
  quickCentros:   'Gestionar Centros',
  quickNoticias:  'Publicar Noticia',
  quickVoluntariado: 'Ver Postulaciones',
  quickMapa:      'Ver Mapa',
} as const;

export type DashboardStrings = typeof DASHBOARD_STRINGS;

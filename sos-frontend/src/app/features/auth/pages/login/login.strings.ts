/**
 * Strings del componente de Login.
 * Centraliza todos los textos visibles para facilitar mantenimiento y futura i18n.
 */
export const LOGIN_STRINGS = {
  // Panel izquierdo
  logoTag:       'Tu cuenta SOS.exe',
  panelTitulo:   'Tu ayuda y participación, en un solo lugar',
  panelDescripcion: 'Ingresa para continuar apoyando a centros, refugios y comunidades de forma segura.',

  // Formulario
  tituloPagina:  'Iniciar sesión',
  subtitulo:     'Ingresa con el correo y la contraseña de tu cuenta.',
  labelEmail:    'Correo electrónico',
  placeholderEmail: 'correo@ejemplo.com',
  errorEmail:    'Ingresa un correo válido.',
  labelPassword: 'Contraseña',
  placeholderPassword: 'Ingresa tu contraseña',
  errorPassword: 'La contraseña es obligatoria.',
  botonSubmit:   'Iniciar sesión →',
  botonCargando: 'Ingresando...',

  // Links
  linkRegistro:  '¿Aún no tienes una cuenta? Crear una cuenta',
  linkCancelar:  'Cancelar y volver al sitio',

  // Alertas
  errorCredenciales: 'Credenciales incorrectas. Verifica tu correo y contraseña.',
} as const;

export type LoginStrings = typeof LOGIN_STRINGS;

/**
 * Strings del componente de Registro.
 * Centraliza todos los textos visibles para facilitar mantenimiento y futura i18n.
 */
export const REGISTRO_STRINGS = {
  // Panel izquierdo
  logoTag:       'Tu cuenta SOS.exe',
  panelTitulo:   'Únete a la comunidad de ayuda',
  panelDescripcion: 'Crea tu cuenta para conectar con centros, refugios y comunidades que necesitan tu apoyo.',
  feature1:      'Coordina voluntariados fácilmente',
  feature2:      'Realiza donaciones de forma segura',
  feature3:      'Encuentra centros de ayuda cercanos',

  // Formulario
  tituloPagina:  'Crear cuenta',
  subtitulo:     'Completa los datos para registrarte en SOS.exe.',
  labelNombre:   'Nombre completo',
  placeholderNombre: 'Tu nombre completo',
  errorNombre:   'El nombre es obligatorio.',
  labelEmail:    'Correo electrónico',
  placeholderEmail: 'correo@ejemplo.com',
  errorEmail:    'Ingresa un correo válido.',
  labelPassword: 'Contraseña',
  placeholderPassword: 'Mínimo 6 caracteres',
  errorPassword: 'La contraseña debe tener al menos 6 caracteres.',
  labelTelefono: 'Teléfono',
  labelOpcional: '(opcional)',
  placeholderTelefono: 'Ej: 77712345',
  botonSubmit:   'Crear cuenta →',
  botonCargando: 'Registrando...',

  // Links
  linkLogin:     '¿Ya tienes una cuenta? Iniciar sesión',
  linkCancelar:  'Cancelar y volver al sitio',
} as const;

export type RegistroStrings = typeof REGISTRO_STRINGS;

export const APP_TEXTOS = {

  navbar: {
    marca: 'SOS.exe',
    lema: 'Juntos ante desastres naturales',

    iconoMarca: '✛',
    iconoMenu: '☰',
    iconoNotificacion: '🔔',

    enlaces: {
      inicio: 'Inicio',
      mapa: 'Mapa',
      donar: 'Donar',
      voluntariados: 'Voluntariados',
      noticias: 'Noticias',
      acercaDe: 'Acerca de',
    },

    notificacionesAria: 'Notificaciones',
    cantidadNotificaciones: '1',

    iniciarSesion: 'Iniciar sesión',
    quieroAyudar: '♥ Quiero ayudar',
  },


  login: {
    logo: 'Tu cuenta SOS.exe',

    tituloPrincipal:
      'Tu ayuda y participación, en un solo lugar',

    descripcionPrincipal:
      'Ingresa para continuar apoyando a centros, refugios y comunidades de forma segura.',

    tituloFormulario:
      'Iniciar sesión',

    descripcionFormulario:
      'Ingresa con el correo y la contraseña de tu cuenta.',

    correoLabel:
      'Correo electrónico',

    correoPlaceholder:
      'correo@ejemplo.com',

    correoError:
      'Ingresa un correo válido.',

    passwordLabel:
      'Contraseña',

    passwordPlaceholder:
      'Ingresa tu contraseña',

    passwordError:
      'La contraseña es obligatoria.',

    botonIngresar:
      'Iniciar sesión →',

    crearCuenta:
      '¿Aún no tienes una cuenta? Crear una cuenta',

    cancelar:
      'Cancelar y volver al sitio',

    credencialesIncorrectas:
      'Correo o contraseña incorrectos.',
  },
  centros: {
  cargando:
    'Cargando centros...',

  vacio:
    'No hay centros registrados.',

  errorCarga:
    'No se pudieron cargar los centros',

  tipo:
    'Tipo:',

  ciudad:
    'Ciudad:',

  direccion:
    'Dirección:',
},

inicio: {

  hero: {
    badge:
      'Respuesta solo en Bolivia',

    titulo:
      'Ayuda que llega,',

    tituloDestacado:
      'esperanza que permanece.',

    descripcion:
      'Conectamos a personas, comunidades y recursos para responder juntos ante desastres en Bolivia.',

    quieroAyudar:
      '♥ Quiero ayudar',

    explorarMapa:
      'Explorar el mapa',

    caracteristicas: {
      centros:
        '✓ Centros verificados',

      donaciones:
        '✓ Donaciones seguras',

      informacion:
        '✓ Información actualizada',
    },
  },


  imagenes: {
    referencial:
      'Imagen referencial',

    incendioAlt:
      'Bomberos trabajando durante un incendio forestal',

    donacionesAlt:
      'Voluntarios organizando donaciones',

    refugioAlt:
      'Voluntaria ayudando en un refugio',

    inundacionAlt:
      'Respuesta comunitaria ante una inundación',

    cajasAyudaAlt:
      'Personas preparando cajas de ayuda',
  },


  acciones: {

    donar: {
      icono:
        '♥',

      titulo:
        'Donar',

      descripcion:
        'Apoya a comunidades afectadas',

      flecha:
        '→',
    },


    centros: {
      icono:
        '⌂',

      titulo:
        'Centros y refugios',

      descripcion:
        'Encuentra lugares seguros y verificados',

      flecha:
        '→',
    },


    voluntariado: {
      icono:
        '●',

      titulo:
        'Voluntariado',

      descripcion:
        'Ofrece tu tiempo y habilidades para ayudar',

      flecha:
        '→',
    },


    emergencias: {
      icono:
        '!',

      titulo:
        'Emergencias',

      descripcion:
        'Consulta alertas y avisos activos',

      flecha:
        '→',
    },
  },


  noticias: {
    titulo:
      'Noticias y alertas recientes',

    descripcion:
      'Información verificada sobre emergencias y respuesta comunitaria en Bolivia.',

    verTodas:
      'Ver todas las noticias →',

    fuenteVerificada:
      '✓ Fuente verificada',

    imagenReferencial:
      'Imagen referencial',

    ubicacionIcono:
      '⌖',

    sinNoticias:
      'No hay noticias disponibles para esta categoría.',
  },

},

} as const;
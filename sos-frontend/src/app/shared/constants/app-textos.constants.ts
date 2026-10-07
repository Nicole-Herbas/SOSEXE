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
mapa: {
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

  sinResultados:
    'No se encontraron puntos con los filtros seleccionados.',

  cargando: 'Cargando puntos del mapa…',

  errorCarga:
    'No se pudieron cargar los puntos. Intenta de nuevo.',

  mensajeMapa:
    'Mapa interactivo · Implementado con Leaflet',

  contadorVerificados:
    'puntos verificados',

  detalle: {
    direccionEtiqueta:
      'DIRECCIÓN',

    horarioEtiqueta:
      'HORARIO O ESTADO',

    contactoEtiqueta:
      'CONTACTO',

    necesidadesEtiqueta:
      'NECESIDADES PRIORITARIAS',

    donacionesEtiqueta:
      'DONACIONES QUE ACEPTA',

    comoLlegar:
      'Cómo llegar',

    verCentro:
      'Ver centro',

    reportar:
      'Reportar información incorrecta',

    informacionVerificada:
      'Información comprobada pendiente de revisión',
  },

  filtrosTipo: {
    todos:
      'Todos',

    centroApoyo:
      'Centros de apoyo',

    refugio:
      'Refugios',

    puntoDonacion:
      'Puntos de donación',

    emergencia:
      'Emergencias',
  },

  filtrosNecesidad: {
    todas:
      'Todas',

    agua:
      '💧 Agua',

    alimentos:
      '◉ Alimentos',

    medicamentos:
      '✦ Medicamentos',

    ropa:
      '▭ Ropa',

    herramientas:
      '✚ Herramientas',

    voluntarios:
      '● Voluntarios',

    higiene:
      '✦ Higiene',

    primerosAuxilios:
      '✚ Primeros auxilios',

    alojamiento:
      '⌂ Alojamiento',
  },

  tipos: {
    centroApoyo:
      'Centro de apoyo',

    refugio:
      'Refugio',

    puntoDonacion:
      'Punto de donación',

    emergencia:
      'Emergencia',
  },
},

donar: {
  mensaje:
    'donar works!',
},

noticias: {
  // ── Encabezado de la página ──────────────────────────────────────────────
  volverInicio:
    '← Volver al inicio',

  titulo:
    'Noticias y alertas',

  subtitulo:
    'Información verificada sobre emergencias, desastres y acciones de ayuda en Bolivia.',

  // ── Filtros de categoría ─────────────────────────────────────────────────
  filtroTodas:
    'Todas',

  filtros: [
    'Todas',
    'Incendios',
    'Inundaciones',
    'Deslizamientos',
    'Sequías',
    'Comunidad',
    'Alertas',
    'Otras',
  ] as const,

  // ── Sección "Últimas actualizaciones" ────────────────────────────────────
  ultimasTitulo:
    'Últimas actualizaciones',

  ultimasDesc:
    'Las noticias más recientes sobre la situación en Bolivia.',

  // ── Tarjeta de noticia ───────────────────────────────────────────────────
  fuenteVerificada:
    '✓ Fuente verificada',

  imagenReferencial:
    'Imagen referencial',

  imagenNoDisponible:
    'Imagen no disponible',

  categoriaGeneral:
    'Noticias',

  categoriaOtras:
    'Otras',

  leerNoticia:
    'Leer noticia →',

  reintentar:
    'Intentar de nuevo',

  categoriasEtiqueta:
    'Categorías de noticias',

  ubicacionIcono:
    '⌖',

  ubicacion:
    'Bolivia',

  // ── Sección "Alertas activas" (parte inferior de la página) ─────────────
  alertasTitulo:
    'Alertas activas',

  alertasDesc:
    'Situaciones que requieren atención inmediata en este momento.',

  alertaActivaBadge:
    'Alerta activa',

  alertaTituloReferencia:
    'Inundaciones en zonas cercanas al río Piraí',

  alertaMensajeReferencia:
    'Niveles elevados del río Piraí afectan comunidades en Santa Cruz. Se recomienda alejarse de las riberas y seguir las indicaciones de Defensa Civil.',

  alertaUbicacionReferencia:
    'Santa Cruz, Bolivia',

  alertaActualizadoReferencia:
    'hoy, 15:35',

  verEnMapa:
    'Ver en el mapa →',

  actualizado:
    'Actualizado:',

  // ── Estados de carga ─────────────────────────────────────────────────────
  cargando:
    'Cargando noticias...',

  sinNoticias:
    'No hay noticias disponibles para esta categoría.',

  errorCarga:
    'No se pudieron cargar las noticias. Intenta de nuevo.',

  apiNoDisponible:
    'Las noticias externas no están disponibles en este momento.',

  apiNoDisponibleCache:
    'No se pudieron actualizar las noticias externas. Mostrando los últimos datos disponibles.',
},

voluntariado: {
  mensaje:
    'voluntariado works!',
},

acercaDe: {
  mensaje:
    'acerca-de works!',
},

registro: {
  logo: 'Tu cuenta SOS.exe',

  tituloPrincipal:
    'Únete y marca la diferencia',

  descripcionPrincipal:
    'Regístrate para apoyar a comunidades afectadas por desastres en Bolivia.',

  tituloFormulario:
    'Crear una cuenta',

  descripcionFormulario:
    'Completa tus datos para unirte a SOS.exe.',

  nombreLabel:
    'Nombre completo',

  nombrePlaceholder:
    'Tu nombre completo',

  nombreError:
    'El nombre es obligatorio (mínimo 2 caracteres).',

  correoLabel:
    'Correo electrónico',

  correoPlaceholder:
    'correo@ejemplo.com',

  correoError:
    'Ingresa un correo válido.',

  passwordLabel:
    'Contraseña',

  passwordPlaceholder:
    'Mínimo 6 caracteres',

  passwordError:
    'La contraseña debe tener al menos 6 caracteres.',

  telefonoLabel:
    'Teléfono (opcional)',

  telefonoPlaceholder:
    '+591 7xxxxxxx',

  departamentoLabel:
    'Departamento (opcional)',

  departamentoPlaceholder:
    'Selecciona tu departamento',

  botonRegistrar:
    'Crear cuenta →',

  yasTienesCuenta:
    '¿Ya tienes una cuenta? Iniciar sesión',

  cancelar:
    'Cancelar y volver al sitio',

  registroExitoso:
    '¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...',

  correoExistente:
    'Este correo ya está registrado. Prueba con otro.',

  errorGeneral:
    'Ocurrió un error al crear la cuenta. Intenta de nuevo.',
},
  registrarCentro: {

    header: {
      volverAcerca: '← Volver a Acerca de',
      badge: 'Solicitud de verificación',

      titulo:
        'Registra tu centro o refugio',

      descripcion:
        'Completa la información para que el equipo administrador pueda comprobar la organización antes de publicarla.',

      solicitudPrivada:
        '🔒 Solicitud privada',

      noPublicacionAutomatica:
        'Nada se publica automáticamente.',
    },


    pasos: {
      centro: 'Centro',
      responsableUbicacion: 'Responsable y ubicación',
      documentos: 'Documentos',
      necesidadesVoluntariado:
        'Necesidades y voluntariado',
      revisionEnvio:
        'Revisión y envío',

      paso: 'Paso',
      de: 'de',
    },


    paso1: {

      titulo:
        'Información del centro',

      descripcion:
        'Cuéntanos qué organización solicita ser verificada.',

      nombreLabel:
        'Nombre oficial del centro o refugio',

      nombrePlaceholder:
        'Ej.: Centro de Apoyo San José',

      tipoLabel:
        'Tipo de organización',

      tipoPlaceholder:
        'Selecciona una opción',

      departamentoLabel:
        'Departamento',

      departamentoPlaceholder:
        'Selecciona un departamento',

      nitLabel:
        'NIT',

      nitPlaceholder:
        'Número de Identificación Tributaria',

      personeriaLabel:
        'Personería jurídica',

      personeriaPlaceholder:
        'Número o resolución',

      fechaFundacionLabel:
        'Fecha de fundación',

      paginaWebLabel:
        'Página web o red social oficial',

      paginaWebPlaceholder:
        'https://...',

      descripcionLabel:
        'Descripción del centro',

      descripcionPlaceholder:
        'Explica qué hace el centro, a quién ayuda y desde cuándo trabaja.',

      poblacionLabel:
        'Población atendida',

      poblacionPlaceholder:
        'Ej.: familias afectadas, niños, adultos mayores o animales',
    },


    paso2: {

      titulo:
        'Responsable y ubicación',

      descripcion:
        'Indica quién representa al centro y dónde se encuentra.',

      responsableTitulo:
        'Persona responsable',

      responsableDescripcion:
        'Datos de la persona que podrá responder durante la verificación.',

      nombreLabel:
        'Nombre completo',

      nombrePlaceholder:
        'Nombre y apellidos',

      cargoLabel:
        'Cargo o relación con el centro',

      cargoPlaceholder:
        'Ej.: Representante legal',

      documentoLabel:
        'Documento de identidad',

      documentoPlaceholder:
        'Cédula de identidad',

      correoLabel:
        'Correo electrónico',

      correoPlaceholder:
        'correo@centro.org',

      telefonoLabel:
        'Teléfono o WhatsApp',

      telefonoPlaceholder:
        '+591 ...',

      ubicacionTitulo:
        'Ubicación del centro',

      ubicacionDescripcion:
        'Esta información permitirá ubicar el centro en el mapa.',

      ciudadLabel:
        'Ciudad o municipio',

      ciudadPlaceholder:
        'Ej.: Cochabamba',

      departamentoLabel:
        'Departamento',

      departamentoPlaceholder:
        'Selecciona un departamento',

      direccionLabel:
        'Dirección exacta',

      direccionPlaceholder:
        'Zona, avenida, calle y número',

      referenciaLabel:
        'Referencia para llegar',

      referenciaPlaceholder:
        'Ej.: a media cuadra de la plaza principal',
    },


    paso3: {

      titulo:
        'Documentos de respaldo',

      descripcion:
        'Adjunta los documentos que permitan verificar la existencia y representación del centro.',

      personeriaTitulo:
        'Personería jurídica o documento de constitución',

      personeriaDescripcion:
        'Documento que demuestra la existencia legal de la organización.',

      nitTitulo:
        'Documento del NIT',

      nitDescripcion:
        'Constancia vigente del Número de Identificación Tributaria.',

      identidadTitulo:
        'Identidad y poder del representante legal',

      identidadDescripcion:
        'Cédula de identidad y documento que respalda su representación.',

      domicilioTitulo:
        'Respaldo del domicilio del centro',

      domicilioDescripcion:
        'Factura de servicio, contrato o documento con la dirección declarada.',

      adjuntarArchivo:
        'Adjuntar archivo',

      quitarArchivo:
        'Quitar archivo',

      informacionImportante:
        'Información importante:',

      documentosPrivados:
        'Los documentos solo serán visibles para el equipo encargado de revisar la solicitud.',
    },


    paso4: {

      titulo:
        'Necesidades y voluntariado',

      descripcion:
        'Indica qué necesita actualmente el centro y si requiere apoyo de voluntarios.',

      necesidadesTitulo:
        'Necesidades prioritarias',

      necesidadesDescripcion:
        'Selecciona los recursos que el centro necesita actualmente.',

      donacionesTitulo:
        'Donaciones que acepta',

      donacionesDescripcion:
        'Selecciona los tipos de donaciones que el centro puede recibir.',

      voluntariadoTitulo:
        'Voluntariado',

      voluntariadoDescripcion:
        'Indica si el centro necesita personas voluntarias.',

      necesitaVoluntarios:
        'Sí, necesitamos voluntarios',

      necesitaVoluntariosDescripcion:
        'El centro desea recibir apoyo de personas voluntarias.',

      noNecesitaVoluntarios:
        'No necesitamos voluntarios',

      noNecesitaVoluntariosDescripcion:
        'Actualmente el centro no requiere voluntariado.',

      actividadesLabel:
        '¿En qué actividades necesitas voluntarios?',

      descripcionApoyoLabel:
        'Describe qué tipo de apoyo necesitas',

      descripcionApoyoPlaceholder:
        'Ej.: Necesitamos personas para apoyar en actividades educativas durante las tardes.',
    },


    paso5: {

      titulo:
        'Revisión y envío',

      antesDeEnviar:
        '🔒 Antes de enviar',

      avisoEnvio:
        'La solicitud será enviada al equipo administrador para su revisión. El centro no será publicado automáticamente.',

      iniciarSesion:
        'Inicia sesión para enviar',

      necesitaCuenta:
        'Necesitas una cuenta para enviar la solicitud.',

      irIniciarSesion:
        'Ir a iniciar sesión',

      enviar:
        'Enviar solicitud →',

      enviando:
        'Enviando...',
    },


    opciones: {

      tiposOrganizacion: [
        'Centro de apoyo',
        'Refugio',
        'Organización no gubernamental',
        'Fundación',
        'Institución pública',
        'Organización comunitaria',
        'Otro',
      ],

      necesidades: [
        'Alimentos',
        'Medicamentos',
        'Ropa',
        'Útiles escolares',
        'Productos de higiene',
        'Artículos para animales',
        'Apoyo económico',
        'Otro',
      ],

      donaciones: [
        'Alimentos',
        'Ropa',
        'Medicamentos',
        'Útiles escolares',
        'Productos de higiene',
        'Dinero',
        'Artículos para animales',
        'Otro',
      ],

      actividadesVoluntariado: [
        'Atención y acompañamiento',
        'Apoyo educativo',
        'Salud',
        'Logística',
        'Cocina',
        'Limpieza',
        'Cuidado de animales',
        'Comunicación',
        'Otro',
      ],
    },


    resumen: {

      titulo:
        'RESUMEN DE LA SOLICITUD',

      centroPlaceholder:
        'Tu centro o refugio',

      ubicacionPendiente:
        'Ubicación pendiente',

      paso:
        'Paso',

      verificacionTitulo:
        '✓ Se mostrará tras la verificación',

      verificacionDescripcion:
        'La información no será pública hasta que un administrador revise y apruebe la solicitud.',

      necesidadesTitulo:
        'NECESIDADES PRIORITARIAS',

      donacionesTitulo:
        'DONACIONES QUE ACEPTA',

      voluntariadoTitulo:
        'VOLUNTARIADO',

      sinSeleccionar:
        'Aún no seleccionadas',

      noSolicitaVoluntarios:
        'No solicita voluntarios',

      documentosAnadidos:
        'Documentos añadidos',

      resumenFooter:
        'Podrás actualizar necesidades, horarios y vacantes cuando cambie la situación del centro.',
    },


    acciones: {

      cancelar:
        '← Cancelar',

      atras:
        '← Atrás',

      guardarBorrador:
        'Guardar borrador',

      continuar:
        'Continuar →',

      entendido:
        'Entendido',

      revisarCompletar:
        'Revisar y completar',

      cerrar:
        'Cerrar',

      iniciarSesion:
        'Iniciar sesión',
    },


    archivos: {

      formatoInvalido:
        'Formato no válido. Solo se permiten archivos PDF, JPG, PNG o WEBP.',

      archivoGrande:
        'El archivo es demasiado grande. El tamaño máximo permitido es de 10 MB.',

      vistaPrevia:
        'Vista previa',

      documento:
        'Documento',

      cerrarVistaPrevia:
        'Cerrar vista previa',
    },


    errores: {

      departamentos:
        'No se pudieron cargar los departamentos. Recarga la página.',

      sesionExpirada:
        'Tu sesión expiró. Inicia sesión nuevamente para enviar la solicitud.',

      archivosGrandes:
        'Los archivos superan el tamaño máximo permitido (10 MB por archivo).',

      datosInvalidos:
        'Algunos datos no son válidos. Revisa la información y completa lo que falta.',

      errorEnvio:
        'No se pudo registrar la solicitud. Revisa los datos e intenta nuevamente.',

      tituloEnvio:
        'No se pudo enviar la solicitud',

      informacionConservada:
        'Tu información sigue aquí; no se perdió nada.',

      errorBorrador:
        'No se pudo guardar el borrador.',
    },


    modalExito: {

      badge:
        'Estado: Pendiente de revisión',

      titulo:
        '¡Registro recibido!',

      descripcion:
        'La solicitud de',

      descripcionFinal:
        'fue enviada correctamente.',

      queSigue:
        '¿Qué sigue?',

      paso1:
        'El equipo administrador revisará los datos y documentos.',

      paso2:
        'Podrá contactarte al correo o teléfono del responsable.',

      paso3:
        'Si todo está en orden, el centro se publicará en la plataforma.',
    },

  },

} as const;

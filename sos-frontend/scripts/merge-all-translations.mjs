import { readFileSync, writeFileSync } from 'fs';

// Helper to set nested key
function setNested(obj, path, value) {
  const parts = path.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!curr[p] || typeof curr[p] !== 'object' || Array.isArray(curr[p])) {
      curr[p] = {};
    }
    curr = curr[p];
  }
  curr[parts[parts.length - 1]] = value;
}

const es = JSON.parse(readFileSync('./public/i18n/es.json', 'utf-8'));
const en = JSON.parse(readFileSync('./public/i18n/en.json', 'utf-8'));

// All key pairs in Spanish and English:
const TRANSLATIONS = [
  // Navbar
  ['navbar.salir', 'Salir', 'Log out'],
  ['navbar.cerrarSesion', 'Cerrar sesión', 'Sign out'],

  // Inicio acciones
  ['inicio.acciones.donar.icono', '♥', '♥'],
  ['inicio.acciones.donar.titulo', 'Donar', 'Donate'],
  ['inicio.acciones.donar.descripcion', 'Apoya a comunidades afectadas', 'Support affected communities'],
  ['inicio.acciones.donar.flecha', '→', '→'],
  ['inicio.acciones.centros.icono', '⌂', '⌂'],
  ['inicio.acciones.centros.titulo', 'Centros y refugios', 'Centers & shelters'],
  ['inicio.acciones.centros.descripcion', 'Encuentra lugares seguros y verificados', 'Find safe and verified locations'],
  ['inicio.acciones.centros.flecha', '→', '→'],
  ['inicio.acciones.voluntariado.icono', '●', '●'],
  ['inicio.acciones.voluntariado.titulo', 'Voluntariado', 'Volunteering'],
  ['inicio.acciones.voluntariado.descripcion', 'Ofrece tu tiempo y habilidades para ayudar', 'Offer your time and skills to help'],
  ['inicio.acciones.voluntariado.flecha', '→', '→'],
  ['inicio.acciones.emergencias.icono', '!', '!'],
  ['inicio.acciones.emergencias.titulo', 'Emergencias', 'Emergencies'],
  ['inicio.acciones.emergencias.descripcion', 'Consulta alertas y avisos activos', 'Check active alerts and notices'],
  ['inicio.acciones.emergencias.flecha', '→', '→'],

  // Inicio imagenes
  ['inicio.imagenes.referencial', 'Imagen referencial', 'Reference image'],
  ['inicio.imagenes.incendioAlt', 'Bomberos trabajando durante un incendio forestal', 'Firefighters working during a forest fire'],
  ['inicio.imagenes.donacionesAlt', 'Voluntarios organizando donaciones', 'Volunteers organizing donations'],
  ['inicio.imagenes.refugioAlt', 'Voluntaria ayudando en un refugio', 'Volunteer helping at a shelter'],
  ['inicio.imagenes.inundacionAlt', 'Respuesta comunitaria ante una inundación', 'Community response to a flood'],
  ['inicio.imagenes.cajasAyudaAlt', 'Personas preparando cajas de ayuda', 'People preparing aid boxes'],

  // Inicio noticias
  ['inicio.noticias.imagenReferencial', 'Imagen referencial', 'Reference image'],
  ['inicio.noticias.ubicacionIcono', '⌖', '⌖'],

  // Mapa
  ['mapa.mensajeMapa', 'Mapa interactivo · Implementado con Leaflet', 'Interactive map · Powered by Leaflet'],
  ['mapa.cerrarDetalle', 'Cerrar detalle', 'Close details'],
  ['mapa.filtrosTipo.todos', 'Todos', 'All'],
  ['mapa.filtrosTipo.centroApoyo', 'Centros de apoyo', 'Support centers'],
  ['mapa.filtrosTipo.refugio', 'Refugios', 'Shelters'],
  ['mapa.filtrosTipo.puntoDonacion', 'Puntos de donación', 'Donation points'],
  ['mapa.filtrosTipo.emergencia', 'Emergencias', 'Emergencies'],
  ['mapa.filtrosNecesidad.todas', 'Todas', 'All'],
  ['mapa.filtrosNecesidad.agua', '💧 Agua', '💧 Water'],
  ['mapa.filtrosNecesidad.alimentos', '◉ Alimentos', '◉ Food'],
  ['mapa.filtrosNecesidad.medicamentos', '✦ Medicamentos', '✦ Medicines'],
  ['mapa.filtrosNecesidad.ropa', '▭ Ropa', '▭ Clothing'],
  ['mapa.filtrosNecesidad.herramientas', '✚ Herramientas', '✚ Tools'],
  ['mapa.filtrosNecesidad.voluntarios', '● Voluntarios', '● Volunteers'],
  ['mapa.filtrosNecesidad.higiene', '✦ Higiene', '✦ Hygiene'],
  ['mapa.filtrosNecesidad.primerosAuxilios', '✚ Primeros auxilios', '✚ First aid'],
  ['mapa.filtrosNecesidad.alojamiento', '⌂ Alojamiento', '⌂ Accommodation'],
  ['mapa.tipos.centroApoyo', 'Centro de apoyo', 'Support center'],
  ['mapa.tipos.refugio', 'Refugio', 'Shelter'],
  ['mapa.tipos.puntoDonacion', 'Punto de donación', 'Donation point'],
  ['mapa.tipos.emergencia', 'Emergencia', 'Emergency'],

  // Mapa detalle
  ['mapa.detalle.direccionEtiqueta', 'DIRECCIÓN', 'ADDRESS'],
  ['mapa.detalle.seleccionaPuntoTitulo', 'Selecciona un punto', 'Select a location'],
  ['mapa.detalle.seleccionaPuntoDescripcion', 'Elige un punto del mapa o de la lista para consultar su información.', 'Choose a point on the map or list to view its information.'],
  ['mapa.detalle.horarioEtiqueta', 'HORARIO O ESTADO', 'HOURS OR STATUS'],
  ['mapa.detalle.contactoEtiqueta', 'CONTACTO', 'CONTACT'],
  ['mapa.detalle.necesidadesEtiqueta', 'NECESIDADES PRIORITARIAS', 'PRIORITY NEEDS'],
  ['mapa.detalle.donacionesEtiqueta', 'DONACIONES QUE ACEPTA', 'ACCEPTED DONATIONS'],
  ['mapa.detalle.comoLlegar', 'Cómo llegar', 'Directions'],
  ['mapa.detalle.verCentro', 'Ver centro', 'View center'],
  ['mapa.detalle.reportar', 'Reportar información incorrecta', 'Report incorrect information'],
  ['mapa.detalle.informacionVerificada', 'Información comprobada pendiente de revisión', 'Verified information pending review'],
  ['mapa.detalle.emailEtiqueta', 'CORREO', 'EMAIL'],
  ['mapa.detalle.actualizadoEtiqueta', 'ÚLTIMA ACTUALIZACIÓN', 'LAST UPDATE'],
  ['mapa.detalle.cargando', 'Cargando detalle...', 'Loading details...'],
  ['mapa.detalle.errorCarga', 'No se pudo cargar el detalle completo.', 'Could not load full details.'],
  ['mapa.detalle.cerrar', 'Cerrar detalle', 'Close details'],
  ['mapa.detalle.reporte.titulo', '¿Qué pasa con este punto?', "What's wrong with this location?"],
  ['mapa.detalle.reporte.yaNoRecibe', 'Ya no recibe donaciones', 'No longer accepting donations'],
  ['mapa.detalle.reporte.direccionIncorrecta', 'La dirección u horario son incorrectos', 'The address or hours are incorrect'],
  ['mapa.detalle.reporte.contactoNoResponde', 'El contacto no responde', 'Contact is not responding'],
  ['mapa.detalle.reporte.noEsReal', 'Creo que no es real', 'I believe it is not real'],
  ['mapa.detalle.reporte.aviso', 'No se cambia el estado de un punto solo por reportes. Un moderador revisará la información antes de realizar cambios.', "A location's status is not changed by reports alone. A moderator will review before applying changes."],
  ['mapa.detalle.reporte.confirmacion', 'Gracias. Pasa a revisión del equipo.', 'Thank you. Sent to team review.'],
  ['mapa.detalle.reporte.cerrar', 'Cerrar reporte', 'Close report'],

  // Noticias
  ['noticias.volverInicio', '← Volver al inicio', '← Back to home'],
  ['noticias.subtitulo', 'Información verificada sobre emergencias, desastres y acciones de ayuda en Bolivia.', 'Verified information on emergencies, disasters, and aid actions in Bolivia.'],
  ['noticias.filtroTodas', 'Todas', 'All'],
  ['noticias.categoriasEtiqueta', 'Categorías de noticias', 'News categories'],
  ['noticias.categorias.todas', 'Todas', 'All'],
  ['noticias.categorias.incendios', 'Incendios', 'Wildfires'],
  ['noticias.categorias.inundaciones', 'Inundaciones', 'Floods'],
  ['noticias.categorias.deslizamientos', 'Deslizamientos', 'Landslides'],
  ['noticias.categorias.sequias', 'Sequías', 'Droughts'],
  ['noticias.categorias.comunidad', 'Comunidad', 'Community'],
  ['noticias.categorias.alertas', 'Alertas', 'Alerts'],
  ['noticias.categorias.otras', 'Otras', 'Others'],
  ['noticias.ultimasTitulo', 'Últimas actualizaciones', 'Latest updates'],
  ['noticias.ultimasDesc', 'Las noticias más recientes sobre la situación en Bolivia.', 'The most recent news about the situation in Bolivia.'],
  ['noticias.fuenteVerificada', '✓ Fuente verificada', '✓ Verified source'],
  ['noticias.imagenReferencial', 'Imagen referencial', 'Reference image'],
  ['noticias.imagenNoDisponible', 'Imagen no disponible', 'Image not available'],
  ['noticias.categoriaGeneral', 'Noticias', 'News'],
  ['noticias.categoriaOtras', 'Otras', 'Others'],
  ['noticias.leerNoticia', 'Leer noticia →', 'Read article →'],
  ['noticias.ubicacionIcono', '⌖', '⌖'],
  ['noticias.ubicacion', 'Bolivia', 'Bolivia'],
  ['noticias.alertasTitulo', 'Alertas activas', 'Active alerts'],
  ['noticias.alertasDesc', 'Situaciones que requieren atención inmediata en este momento.', 'Situations requiring immediate attention right now.'],
  ['noticias.alertaActivaBadge', 'Alerta activa', 'Active alert'],
  ['noticias.alertaTituloReferencia', 'Inundaciones en zonas cercanas al río Piraí', 'Floods in areas near the Piraí River'],
  ['noticias.alertaMensajeReferencia', 'Niveles elevados del río Piraí afectan comunidades en Santa Cruz. Se recomienda alejarse de las riberas y seguir las indicaciones de Defensa Civil.', 'Elevated levels of the Piraí River affect communities in Santa Cruz. Stay away from riverbanks and follow Civil Defense instructions.'],
  ['noticias.alertaUbicacionReferencia', 'Santa Cruz, Bolivia', 'Santa Cruz, Bolivia'],
  ['noticias.alertaActualizadoReferencia', 'hoy, 15:35', 'today, 15:35'],
  ['noticias.verEnMapa', 'Ver en el mapa →', 'View on map →'],
  ['noticias.actualizado', 'Actualizado:', 'Updated:'],
  ['noticias.apiNoDisponible', 'Las noticias externas no están disponibles en este momento.', 'External news is currently unavailable.'],
  ['noticias.apiNoDisponibleCache', 'No se pudieron actualizar las noticias externas. Mostrando los últimos datos disponibles.', 'Could not refresh external news. Showing last available data.'],

  // Voluntariado hero
  ['voluntariado.hero.badge', 'Voluntariado activo en Bolivia', 'Active volunteering in Bolivia'],
  ['voluntariado.hero.titulo', 'Únete como voluntario', 'Join as a volunteer'],
  ['voluntariado.hero.descripcion', 'Las comunidades afectadas por desastres necesitan manos. Crea tu perfil y encuentra oportunidades adaptadas a tus habilidades.', 'Communities affected by disasters need hands. Create your profile and find opportunities suited to your skills.'],
  ['voluntariado.hero.serVoluntario', 'Ser voluntario', 'Become a volunteer'],
  ['voluntariado.hero.verMapa', 'Ver el mapa →', 'View map →'],
  ['voluntariado.hero.feat1', '✓ Centros verificados', '✓ Verified centers'],
  ['voluntariado.hero.feat2', '✓ Sin experiencia previa requerida', '✓ No prior experience required'],
  ['voluntariado.hero.feat3', '✓ Impacto inmediato', '✓ Immediate impact'],

  // Voluntariado oportunidades
  ['voluntariado.oportunidades.titulo', 'Oportunidades disponibles', 'Available opportunities'],
  ['voluntariado.oportunidades.subtitulo', 'Crea tu perfil para ver recomendaciones personalizadas, o explora todas las oportunidades directamente.', 'Create your profile to see personalized recommendations, or browse all opportunities directly.'],
  ['voluntariado.oportunidades.cargando', 'Cargando oportunidades de voluntariado...', 'Loading volunteer opportunities...'],
  ['voluntariado.oportunidades.errorCarga', 'No se pudieron cargar las oportunidades de voluntariado. Intenta de nuevo más tarde.', 'Could not load volunteer opportunities. Please try again later.'],
  ['voluntariado.oportunidades.sinOportunidades', 'No hay oportunidades de voluntariado publicadas por el momento.', 'There are no volunteer opportunities published at this time.'],
  ['voluntariado.oportunidades.verDetalle', 'Ver detalle', 'View details'],
  ['voluntariado.oportunidades.verDetalleEtiqueta', 'Ver detalle de', 'View details of'],
  ['voluntariado.oportunidades.centroLabel', 'Centro responsable', 'Responsible center'],
  ['voluntariado.oportunidades.inicioLabel', 'Inicio', 'Start'],
  ['voluntariado.oportunidades.finLabel', 'Finalización', 'End'],
  ['voluntariado.oportunidades.centroNoDisponible', 'Centro no disponible', 'Center not available'],
  ['voluntariado.oportunidades.ubicacionNoDisponible', 'Ubicación no disponible', 'Location not available'],
  ['voluntariado.oportunidades.fechaNoDisponible', 'Fecha no disponible', 'Date not available'],
  ['voluntariado.oportunidades.cuposLabel', 'Cupos disponibles', 'Available spots'],
  ['voluntariado.oportunidades.participar', 'Participar', 'Participate'],

  // Voluntariado filtros
  ['voluntariado.oportunidades.filtros.ciudadLabel', 'Ciudad', 'City'],
  ['voluntariado.oportunidades.filtros.todasCiudades', 'Todas las ciudades', 'All cities'],
  ['voluntariado.oportunidades.filtros.tipoAyudaLabel', 'Tipo de ayuda', 'Help type'],
  ['voluntariado.oportunidades.filtros.todosTiposAyuda', 'Todos los tipos de ayuda', 'All help types'],
  ['voluntariado.oportunidades.filtros.restablecer', 'Restablecer filtros', 'Reset filters'],
  ['voluntariado.oportunidades.filtros.resultadosLabel', 'Resultados encontrados', 'Results found'],
  ['voluntariado.oportunidades.filtros.sinResultados', 'No hay oportunidades que coincidan con los filtros seleccionados.', 'No opportunities match the selected filters.'],

  // Voluntariado detalle oportunidad
  ['voluntariado.oportunidades.detalle.titulo', 'Detalle de oportunidad', 'Opportunity details'],
  ['voluntariado.oportunidades.detalle.descripcion', 'Descripción', 'Description'],
  ['voluntariado.oportunidades.detalle.habilidades', 'Habilidades requeridas', 'Required skills'],
  ['voluntariado.oportunidades.detalle.inicio', 'Inicio', 'Start'],
  ['voluntariado.oportunidades.detalle.fin', 'Finalización', 'End'],
  ['voluntariado.oportunidades.detalle.centro', 'Centro responsable', 'Responsible center'],
  ['voluntariado.oportunidades.detalle.ciudad', 'Ciudad', 'City'],
  ['voluntariado.oportunidades.detalle.departamento', 'Departamento', 'Department'],
  ['voluntariado.oportunidades.detalle.noInformado', 'No informado', 'Not specified'],
  ['voluntariado.oportunidades.detalle.volver', 'Volver a oportunidades', 'Back to opportunities'],
  ['voluntariado.oportunidades.detalle.cargando', 'Cargando detalle de la oportunidad...', 'Loading opportunity details...'],
  ['voluntariado.oportunidades.detalle.noEncontrada', 'La oportunidad no existe o no está publicada.', 'Opportunity does not exist or is not published.'],
  ['voluntariado.oportunidades.detalle.idInvalido', 'El identificador de la oportunidad no es válido.', 'Invalid opportunity identifier.'],
  ['voluntariado.oportunidades.detalle.errorCarga', 'No se pudo cargar la oportunidad. Comprueba tu conexión e intenta de nuevo.', 'Could not load opportunity. Check your connection and try again.'],
  ['voluntariado.oportunidades.detalle.reintentar', 'Reintentar', 'Retry'],

  // Voluntariado oportunidades estáticas
  ['voluntariado.oportunidades.refugios.titulo', 'Refugios y albergues', 'Shelters and hospices'],
  ['voluntariado.oportunidades.refugios.ubicacion', 'Cochabamba, Bolivia', 'Cochabamba, Bolivia'],
  ['voluntariado.oportunidades.refugios.descripcion', 'Ayuda a gestionar albergues temporales: registro de familias, asignación de espacios y atención básica a personas desplazadas.', 'Help manage temporary shelters: family registration, space allocation, and basic care for displaced people.'],
  ['voluntariado.oportunidades.refugios.cupos', '12 cupos', '12 spots'],
  ['voluntariado.oportunidades.distribucion.titulo', 'Distribución de donaciones', 'Donation distribution'],
  ['voluntariado.oportunidades.distribucion.ubicacion', 'La Paz, Bolivia', 'La Paz, Bolivia'],
  ['voluntariado.oportunidades.distribucion.descripcion', 'Participa en la clasificación, empaque y entrega de donaciones a comunidades afectadas. Se necesita disponibilidad de tiempo y esfuerzo físico.', 'Participate in sorting, packing, and delivering donations to affected communities. Time availability and physical effort needed.'],
  ['voluntariado.oportunidades.distribucion.cupos', '8 cupos', '8 spots'],
  ['voluntariado.oportunidades.emergencias.titulo', 'Apoyo en emergencias', 'Emergency support'],
  ['voluntariado.oportunidades.emergencias.ubicacion', 'Santa Cruz, Bolivia', 'Santa Cruz, Bolivia'],
  ['voluntariado.oportunidades.emergencias.descripcion', 'Brinda asistencia directa durante emergencias activas: comunicación, logística y coordinación con brigadas locales y cuerpos de rescate.', 'Provide direct assistance during active emergencies: communication, logistics, and coordination with local brigades and rescue teams.'],
  ['voluntariado.oportunidades.emergencias.cupos', '5 cupos', '5 spots'],

  // Voluntariado cómo funciona
  ['voluntariado.comoFunciona.titulo', '¿Cómo funciona?', 'How does it work?'],
  ['voluntariado.comoFunciona.subtitulo', 'Tres pasos para empezar a ayudar.', 'Three steps to start helping.'],
  ['voluntariado.comoFunciona.paso1.titulo', 'Crea tu perfil', 'Create your profile'],
  ['voluntariado.comoFunciona.paso1.descripcion', 'Indica tus habilidades y disponibilidad para recibir recomendaciones personalizadas.', 'State your skills and availability to receive personalized recommendations.'],
  ['voluntariado.comoFunciona.paso2.titulo', 'Elige una oportunidad', 'Choose an opportunity'],
  ['voluntariado.comoFunciona.paso2.descripcion', 'Selecciona la actividad que mejor se adapte a tu tiempo y ubicación.', 'Select the activity that best suits your time and location.'],
  ['voluntariado.comoFunciona.paso3.titulo', 'Empieza a ayudar', 'Start helping'],
  ['voluntariado.comoFunciona.paso3.descripcion', 'Recibirás confirmación e instrucciones para presentarte al centro de coordinación.', 'You will receive confirmation and instructions to report to the coordination center.'],

  // Voluntariado perfil wizard
  ['voluntariado.perfilVoluntario.pasos.datosPersonales', 'Datos personales', 'Personal details'],
  ['voluntariado.perfilVoluntario.pasos.habilidades', 'Habilidades', 'Skills'],
  ['voluntariado.perfilVoluntario.pasos.disponibilidad', 'Disponibilidad', 'Availability'],
  ['voluntariado.perfilVoluntario.paso1.titulo', 'Crea tu perfil de voluntario', 'Create your volunteer profile'],
  ['voluntariado.perfilVoluntario.paso1.subtitulo', 'Cuéntanos quién eres para conectarte con las oportunidades adecuadas.', 'Tell us who you are so we can connect you with the right opportunities.'],
  ['voluntariado.perfilVoluntario.paso1.nombreLabel', 'NOMBRE COMPLETO', 'FULL NAME'],
  ['voluntariado.perfilVoluntario.paso1.nombrePlaceholder', 'Ej. María González Quispe', 'E.g. María González Quispe'],
  ['voluntariado.perfilVoluntario.paso1.telefonoLabel', 'TELÉFONO / CELULAR', 'PHONE / CELL'],
  ['voluntariado.perfilVoluntario.paso1.telefonoPlaceholder', '+591 7XX XXX XXX', '+591 7XX XXX XXX'],
  ['voluntariado.perfilVoluntario.paso1.telefonoError', 'El teléfono es obligatorio.', 'Phone number is required.'],
  ['voluntariado.perfilVoluntario.paso1.correoLabel', 'CORREO ELECTRÓNICO', 'EMAIL ADDRESS'],
  ['voluntariado.perfilVoluntario.paso1.correoPlaceholder', 'tu@correo.com', 'your@email.com'],
  ['voluntariado.perfilVoluntario.paso1.departamentoLabel', 'DEPARTAMENTO', 'DEPARTMENT'],
  ['voluntariado.perfilVoluntario.paso1.departamentoPlaceholder', 'Selecciona un departamento', 'Select a department'],
  ['voluntariado.perfilVoluntario.paso1.departamentoError', 'Selecciona un departamento.', 'Select a department.'],
  ['voluntariado.perfilVoluntario.paso1.ciudadLabel', 'CIUDAD / MUNICIPIO', 'CITY / MUNICIPALITY'],
  ['voluntariado.perfilVoluntario.paso1.ciudadPlaceholder', 'Ej. Cochabamba', 'E.g. Cochabamba'],
  ['voluntariado.perfilVoluntario.paso1.ciudadError', 'La ciudad es obligatoria.', 'City is required.'],
  ['voluntariado.perfilVoluntario.paso1.continuar', 'Continuar →', 'Continue →'],

  ['voluntariado.perfilVoluntario.paso2.titulo', 'Crea tu perfil de voluntario', 'Create your volunteer profile'],
  ['voluntariado.perfilVoluntario.paso2.subtitulo', 'Selecciona las habilidades que puedes aportar. Elige todas las que apliquen.', 'Select the skills you can contribute. Choose all that apply.'],
  ['voluntariado.perfilVoluntario.paso2.ningunaSeleccionada', 'Ninguna habilidad seleccionada todavía.', 'No skills selected yet.'],
  ['voluntariado.perfilVoluntario.paso2.seleccionadas', 'habilidades seleccionadas.', 'skills selected.'],
  ['voluntariado.perfilVoluntario.paso2.habilidadError', 'Selecciona al menos una habilidad.', 'Select at least one skill.'],
  ['voluntariado.perfilVoluntario.paso2.notaExperiencia', 'No te preocupes si no tienes experiencia previa — la mayoría de oportunidades no la requieren.', "Don't worry if you have no prior experience — most opportunities do not require it."],
  ['voluntariado.perfilVoluntario.paso2.anterior', '← Anterior', '← Previous'],
  ['voluntariado.perfilVoluntario.paso2.continuar', 'Continuar →', 'Continue →'],

  ['voluntariado.perfilVoluntario.paso3.titulo', 'Crea tu perfil de voluntario', 'Create your volunteer profile'],
  ['voluntariado.perfilVoluntario.paso3.subtitulo', 'Indica cuándo puedes participar para mostrarte oportunidades compatibles.', 'Indicate when you can participate to see compatible opportunities.'],
  ['voluntariado.perfilVoluntario.paso3.ningunaSeleccionada', 'Ninguna opción seleccionada todavía.', 'No option selected yet.'],
  ['voluntariado.perfilVoluntario.paso3.seleccionadas', 'opciones seleccionadas.', 'options selected.'],
  ['voluntariado.perfilVoluntario.paso3.disponibilidadError', 'Selecciona al menos una opción de disponibilidad.', 'Select at least one availability option.'],
  ['voluntariado.perfilVoluntario.paso3.notaActualizar', 'Puedes actualizar tu disponibilidad en cualquier momento desde tu perfil.', 'You can update your availability at any time from your profile.'],
  ['voluntariado.perfilVoluntario.paso3.anterior', '← Anterior', '← Previous'],
  ['voluntariado.perfilVoluntario.paso3.crearPerfil', 'Crear perfil de voluntario', 'Create volunteer profile'],
  ['voluntariado.perfilVoluntario.paso3.actualizarPerfil', 'Guardar cambios', 'Save changes'],

  ['voluntariado.perfilVoluntario.exitoTitulo', '¡Perfil creado correctamente, ', 'Profile created successfully, '],
  ['voluntariado.perfilVoluntario.exitoMensaje', 'Encontramos oportunidades para ti basadas en tu perfil y disponibilidad.', 'We found opportunities for you based on your profile and availability.'],
  ['voluntariado.perfilVoluntario.editarPerfil', 'Editar perfil', 'Edit profile'],
  ['voluntariado.perfilVoluntario.tarjetaTitulo', 'Tu perfil de voluntario', 'Your volunteer profile'],
  ['voluntariado.perfilVoluntario.tarjetaTelefono', 'Teléfono', 'Phone'],
  ['voluntariado.perfilVoluntario.tarjetaCorreo', 'Correo', 'Email'],
  ['voluntariado.perfilVoluntario.tarjetaDepartamento', 'Departamento', 'Department'],
  ['voluntariado.perfilVoluntario.tarjetaCiudad', 'Ciudad', 'City'],
  ['voluntariado.perfilVoluntario.tarjetaHabilidades', 'Habilidades', 'Skills'],
  ['voluntariado.perfilVoluntario.tarjetaDisponibilidad', 'Disponibilidad', 'Availability'],
  ['voluntariado.perfilVoluntario.errorCrear', 'No se pudo crear el perfil. Intenta de nuevo.', 'Could not create profile. Try again.'],
  ['voluntariado.perfilVoluntario.errorCargar', 'No se pudo cargar tu perfil.', 'Could not load your profile.'],
  ['voluntariado.perfilVoluntario.errorActualizar', 'No se pudo actualizar el perfil.', 'Could not update profile.'],
  ['voluntariado.perfilVoluntario.perfilActualizado', '¡Perfil actualizado correctamente!', 'Profile updated successfully!'],

  // Acerca de
  ['acercaDe.mensaje', 'acerca-de works!', 'acerca-de works!'],
  ['acercaDe.hero.eyebrow', 'Sobre SOS.exe', 'About SOS.exe'],
  ['acercaDe.hero.titulo', 'Ayuda organizada,', 'Organized help,'],
  ['acercaDe.hero.tituloDestacado', 'transparente y cercana.', 'transparent and close.'],
  ['acercaDe.hero.descripcion', 'SOS.exe conecta a personas, centros verificados y voluntarios para que la ayuda llegue a quienes más la necesitan durante desastres naturales en Bolivia.', 'SOS.exe connects people, verified centers, and volunteers so help reaches those who need it most during natural disasters in Bolivia.'],
  ['acercaDe.hero.centros', 'Centros verificados', 'Verified centers'],
  ['acercaDe.hero.informacion', 'Información clara', 'Clear information'],
  ['acercaDe.hero.comunidad', 'Comunidad solidaria', 'Caring community'],

  ['acercaDe.mision.etiqueta', 'LO QUE BUSCAMOS', 'OUR PURPOSE'],
  ['acercaDe.mision.titulo', 'Nuestra misión', 'Our mission'],
  ['acercaDe.mision.descripcion', 'Facilitar una respuesta solidaria y eficiente ante desastres naturales, garantizando que cada donación y esfuerzo voluntario llegue de forma segura, verificada y oportuna.', 'Facilitate a solidarity-driven and efficient response to natural disasters, ensuring every donation and volunteer effort arrives safely, verified, and timely.'],
  ['acercaDe.mision.conectarTitulo', 'Conectar', 'Connect'],
  ['acercaDe.mision.conectarDescripcion', 'Unimos a personas donantes, centros de apoyo y voluntarios para multiplicar el impacto de cada ayuda.', 'We unite donors, support centers, and volunteers to multiply the impact of every helping hand.'],
  ['acercaDe.mision.verificarTitulo', 'Verificar', 'Verify'],
  ['acercaDe.mision.verificarDescripcion', 'Validamos centros y refugios mediante un proceso riguroso para asegurar confianza y transparencia.', 'We validate centers and shelters through a rigorous process to ensure trust and transparency.'],
  ['acercaDe.mision.responderTitulo', 'Responder', 'Respond'],
  ['acercaDe.mision.responderDescripcion', 'Facilitamos información actualizada para que la ayuda llegue rápido y donde realmente se necesita.', 'We provide up-to-date information so help arrives quickly and where it is truly needed.'],

  ['acercaDe.verificacion.titulo', '¿Cómo verificamos los centros?', 'How do we verify centers?'],
  ['acercaDe.verificacion.insignia', '✓ Centros verificados', '✓ Verified centers'],
  ['acercaDe.verificacion.paso1Titulo', 'Solicitud', 'Application'],
  ['acercaDe.verificacion.paso1Descripcion', 'El centro o refugio completa una solicitud con información básica y documentos.', 'The center or shelter fills out an application with basic information and documents.'],
  ['acercaDe.verificacion.paso2Titulo', 'Revisión de documentos', 'Document review'],
  ['acercaDe.verificacion.paso2Descripcion', 'Revisamos su documentación y verificamos que la información presentada sea válida.', 'We review documentation and verify that submitted information is valid.'],
  ['acercaDe.verificacion.paso3Titulo', 'Validación del centro', 'Center validation'],
  ['acercaDe.verificacion.paso3Descripcion', 'Confirmamos la existencia, actividad, responsables y medios oficiales del centro.', 'We confirm existence, activity, personnel in charge, and official channels of the center.'],
  ['acercaDe.verificacion.paso4Titulo', 'Seguimiento continuo', 'Ongoing monitoring'],
  ['acercaDe.verificacion.paso4Descripcion', 'La información y las necesidades se revisan periódicamente para mantenerlas actualizadas.', 'Information and needs are periodically reviewed to keep them up to date.'],

  ['acercaDe.valores.titulo', 'Nuestros valores', 'Our values'],
  ['acercaDe.valores.descripcion', 'Principios que orientan cada decisión de la plataforma.', 'Principles guiding every platform decision.'],
  ['acercaDe.valores.transparenciaTitulo', 'Transparencia', 'Transparency'],
  ['acercaDe.valores.transparenciaDescripcion', 'Mostramos información clara sobre centros, necesidades y destino de la ayuda.', 'We show clear information about centers, needs, and where aid goes.'],
  ['acercaDe.valores.seguridadTitulo', 'Seguridad', 'Safety'],
  ['acercaDe.valores.seguridadDescripcion', 'Priorizamos centros verificados y procesos confiables para proteger cada aporte.', 'We prioritize verified centers and trusted processes to protect every contribution.'],
  ['acercaDe.valores.comunidadTitulo', 'Comunidad', 'Community'],
  ['acercaDe.valores.comunidadDescripcion', 'Creemos en la colaboración para responder juntos ante situaciones difíciles.', 'We believe in collaboration to respond together to difficult situations.'],
  ['acercaDe.valores.informacionTitulo', 'Información actualizada', 'Up-to-date information'],
  ['acercaDe.valores.informacionDescripcion', 'Mantenemos visibles las necesidades prioritarias, alertas y formas de colaborar.', 'We keep priority needs, alerts, and ways to collaborate visible.'],

  ['acercaDe.roles.titulo', 'Una plataforma para ayudar de distintas formas', 'One platform to help in different ways'],
  ['acercaDe.roles.descripcion', 'Cada rol tiene herramientas y responsabilidades diferentes dentro de SOS.exe.', 'Each role has distinct tools and responsibilities within SOS.exe.'],
  ['acercaDe.roles.donantesTitulo', 'Personas donantes', 'Donors'],
  ['acercaDe.roles.donantesDescripcion', 'Encuentra centros verificados, conoce sus necesidades y elige dónde deseas ayudar.', 'Find verified centers, learn about their needs, and choose where to help.'],
  ['acercaDe.roles.donantesBoton', 'Quiero donar →', 'I want to donate →'],
  ['acercaDe.roles.centrosTitulo', 'Centros y refugios', 'Centers & shelters'],
  ['acercaDe.roles.centrosDescripcion', 'Solicita la verificación de tu centro, publica sus necesidades y crea oportunidades de voluntariado.', 'Request verification for your center, publish needs, and create volunteer opportunities.'],
  ['acercaDe.roles.centrosBoton', 'Registrar mi centro →', 'Register my center →'],
  ['acercaDe.roles.voluntariosTitulo', 'Voluntarios', 'Volunteers'],
  ['acercaDe.roles.voluntariosDescripcion', 'Participa según tu experiencia, disponibilidad y habilidades para apoyar a la comunidad.', 'Participate according to your experience, availability, and skills to support the community.'],
  ['acercaDe.roles.voluntariosBoton', 'Quiero ser voluntario →', 'I want to be a volunteer →'],

  ['acercaDe.cta.etiqueta', 'PARTICIPA', 'PARTICIPATE'],
  ['acercaDe.cta.titulo', 'Cada ayuda cuenta cuando llega al lugar correcto.', 'Every bit of help counts when it reaches the right place.'],
  ['acercaDe.cta.descripcion', 'Únete a una comunidad que responde con solidaridad y responsabilidad en toda Bolivia.', 'Join a community responding with solidarity and responsibility across Bolivia.'],
  ['acercaDe.cta.quieroAyudar', '♥ Quiero ayudar', '♥ I want to help'],
  ['acercaDe.cta.explorarMapa', 'Explorar el mapa', 'Explore the map'],

  ['acercaDe.registrarPunto.titulo', 'Puntos de ayuda', 'Aid points'],
  ['acercaDe.registrarPunto.descripcion', 'Registra un lugar donde se puedan recibir donaciones o brindar ayuda a la comunidad.', 'Register a location where donations can be received or aid provided to the community.'],
  ['acercaDe.registrarPunto.boton', 'Registrar punto de ayuda →', 'Register aid point →'],

  // Preferencias
  ['preferencias.configuracion', 'Configuración', 'Settings'],
  ['preferencias.cancelando', 'Cancelando...', 'Canceling...'],
  ['preferencias.guardando', 'Guardando...', 'Saving...'],

  // Registro
  ['registro.registroExitoso', '¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...', 'Account created successfully! Redirecting to sign in...'],
  ['registro.correoExistente', 'Este correo ya está registrado. Prueba con otro.', 'This email is already registered. Try another.'],
  ['registro.errorGeneral', 'Ocurrió un error al crear la cuenta. Intenta de nuevo.', 'An error occurred while creating your account. Try again.'],
  ['registro.creandoCuenta', 'Creando cuenta...', 'Creating account...'],

  // Alertas
  ['alertas.fuentePendiente', 'Fuente pendiente de completar', 'Source pending completion'],
  ['alertas.errorCambio', 'La alerta cambió o ya fue publicada. Vuelve a cargar la vista previa para revisarla.', 'The alert changed or has already been published. Reload preview to review.'],
  ['alertas.yaNoEsBorrador', 'Esta alerta ya no es un borrador y no puede publicarse desde esta vista.', 'This alert is no longer a draft and cannot be published from this view.']
];

for (const [key, esVal, enVal] of TRANSLATIONS) {
  setNested(es, key, esVal);
  setNested(en, key, enVal);
}

// Write back formatted JSON
writeFileSync('./public/i18n/es.json', JSON.stringify(es, null, 2) + '\n', 'utf-8');
writeFileSync('./public/i18n/en.json', JSON.stringify(en, null, 2) + '\n', 'utf-8');

console.log(`Merged ${TRANSLATIONS.length} translation keys into es.json and en.json.`);

# SOS-36: datos públicos y limitaciones del detalle

## Contacto

El formulario de registro de puntos de ayuda indica: «Estos datos serán utilizados
para coordinar la revisión del punto.» (`APP_TEXTOS.registrarPunto.campos.contactoAyuda`).
La entidad y el flujo de publicación no contienen una autorización explícita para
difundir `nombreContacto`, `telefonoContacto` ni `correoContacto`. Las consultas
públicas de `PuntoAyudaService` usan `convertirADTOPublico`, que elimina expresamente
esos campos y el identificador del creador; los datos se conservan en la consulta
autenticada de los puntos propios.

Estos campos no se incorporan a `PuntoMapaDTO`. El mapa conserva únicamente el
teléfono y correo de los centros que ya entrega su contrato público. Si no hay
contacto público disponible, el panel y el modal muestran «No informado».

Pendiente funcional: definir contacto público separado o una autorización explícita
de publicación antes de exponer los datos personales del registro en el mapa.

## Horario y donaciones

El registro de puntos de donación guarda estos datos en `descripcion`, en líneas
con los prefijos literales `Horario:` y `Donaciones aceptadas:`. El mapa extrae
únicamente esos prefijos al comienzo de una línea, permitiendo sangría. Conserva
las otras líneas; no modifica la respuesta HTTP ni los datos persistidos.

No se infieren valores desde las necesidades, el tipo o el estado del punto.
Los registros antiguos o centros sin esos datos muestran «No informado».
Los prefijos forman parte del formato persistido: cambiar su redacción requiere
mantener compatibilidad con los registros anteriores. No se añaden migraciones.

## Verificación y visibilidad

Panel y modal distinguen VERIFICADO, PENDIENTE y RECHAZADO; estados desconocidos
muestran «No informado». Esto no modifica las reglas de consulta del backend:
los puntos de ayuda no verificados se excluyen del listado y del detalle público.
Los centros se consultan actualmente sin restricción por estado; esta diferencia
preexistente se conserva y debe revisarse por separado si se decide restringirlos.

## Fuera de esta fase

La búsqueda, los filtros, los marcadores y la selección de SOS-34 no se modifican.

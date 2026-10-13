# SOS-56: consulta pública de oportunidades

`GET /api/voluntariados/publicos/{id}` devuelve `ApiResponse<VoluntariadoDTO>`
solo si el estado coincide exactamente con `PUBLICADO`. Una oportunidad inexistente
o en cualquier otro estado responde 404 mediante `ResourceNotFoundException`.

La comprobación en Java también rechaza variantes como `publicado` o `PUBLICADO `,
independientemente de la intercalación de MySQL. Se reutiliza `findById()` y el mapeo
a DTO dentro de una transacción de lectura, que permite acceder a las relaciones LAZY.
No se modifica el esquema ni el mapeo JDBC de las fechas locales.

El detalle conserva descripción, habilidades, fechas, centro y necesidades. El campo
`creadoPorId` se devuelve nulo únicamente en esta nueva consulta. El DTO no incorpora
entidades de usuario, perfiles, datos personales del creador ni del responsable del centro.

## Compatibilidad y exposición preexistente

El cliente Angular de SOS-54/SOS-55 utiliza el listado `GET /api/voluntariados`.
Este sigue consultando `findByEstado("PUBLICADO")` y conserva su respuesta, incluidos
ubicación y necesidades para los filtros. No se modifica el perfil voluntario.

Las consultas antiguas `GET /api/voluntariados/{id}` y
`GET /api/voluntariados/centro/{centroId}` no filtran por estado y son públicas
por la regla GET `/api/voluntariados/**` de `SecurityConfig`. Pueden exponer
oportunidades no publicadas y el identificador del creador incluido en el DTO.

La revisión de los consumidores presentes en el repositorio no encontró llamadas
Angular a esas dos rutas. Esto no demuestra que no existan clientes externos
o usos administrativos que necesiten consultar borradores. Se conservan sus
contratos y los métodos de escritura; la nueva ruta no corrige esa exposición.

Antes de restringir las rutas antiguas debe confirmarse su uso con los consumidores
y definir cómo administradores y responsables autorizados accederán a borradores.
Ocultar datos únicamente en Angular no resuelve la exposición del backend.

## Validación sin bases de datos reales

Las pruebas del servicio, MVC y Spring Security usan repositorios simulados.
Las pruebas existentes de horarios y consultas usan JDBC simulado.
No se inicia el contexto completo con datasource ni se ejecuta Flyway.

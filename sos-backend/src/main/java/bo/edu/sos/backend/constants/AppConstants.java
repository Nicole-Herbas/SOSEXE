package bo.edu.sos.backend.constants;

/**
 * Punto de entrada centralizado de todas las constantes del backend.
 *
 * <p>Cada módulo tiene su propio archivo de constantes dentro del paquete
 * {@code bo.edu.sos.backend.constants}. Esta clase sirve como índice de
 * referencia rápida para el equipo.</p>
 *
 * <h2>Estructura</h2>
 * <pre>
 * constants/
 * ├── AppConstants.java       ← este archivo (índice)
 * ├── ApiRoutes.java          ← rutas REST de todos los controladores
 * ├── Roles.java              ← roles de usuario (ADMIN, USER, VOLUNTARIO)
 * ├── JwtClaims.java          ← claves de los claims del JWT
 * ├── EstadoVerificacion.java ← estados de verificación (Centro, PuntoAyuda)
 * ├── EstadoPostulacion.java  ← estados de postulación (Postulacion)
 * ├── EstadoEnvioSms.java     ← estados de envío SMS (EnvioSms)
 * ├── MapaConstants.java      ← constantes del módulo Mapa (origen de puntos)
 * └── DonacionConstants.java  ← constantes del módulo Donación (prefijo código)
 * </pre>
 *
 * <h2>Cómo agregar nuevas constantes</h2>
 * <ol>
 *   <li>Si pertenece a un módulo existente, agrégalas en su archivo correspondiente.</li>
 *   <li>Si es un módulo nuevo, crea un archivo {@code NombreModuloConstants.java}
 *       con constructor privado y agrega la referencia en este Javadoc.</li>
 * </ol>
 *
 * <h2>Uso</h2>
 * <pre>{@code
 * // Importar solo el archivo del dominio que necesitas:
 * import bo.edu.sos.backend.constants.EstadoVerificacion;
 * import bo.edu.sos.backend.constants.Roles;
 *
 * centro.setEstadoVerificacion(EstadoVerificacion.PENDIENTE);
 * .hasAuthority(Roles.ADMIN)
 * }</pre>
 */
public final class AppConstants {

    private AppConstants() {}
}

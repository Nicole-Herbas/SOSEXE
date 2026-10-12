package bo.edu.sos.backend.constants;

/**
 * Constantes del módulo de Suscripción SMS (SOS-63).
 *
 * Centraliza la validación de teléfono y los mensajes de error
 * para mantenerlos separados de la lógica de negocio.
 */
public final class SuscripcionSmsConstants {

    /** Expresión regular para validar números de teléfono bolivianos e internacionales. */
    public static final String REGEX_TELEFONO = "^\\+?[0-9]{7,15}$";

    /** Mensaje de error cuando el formato del teléfono es inválido. */
    public static final String ERROR_TELEFONO_FORMATO =
            "El número de teléfono debe tener entre 7 y 15 dígitos. "
                    + "Puede comenzar con + para el código de país.";

    /** Mensaje de error cuando el teléfono está vacío. */
    public static final String ERROR_TELEFONO_REQUERIDO =
            "El número de teléfono es obligatorio.";

    /** Mensaje de error cuando el departamento no se selecciona. */
    public static final String ERROR_DEPARTAMENTO_REQUERIDO =
            "Debes seleccionar un departamento.";

    /** Mensaje cuando ya existe una suscripción cancelada que se reactiva. */
    public static final String INFO_SUSCRIPCION_REACTIVADA =
            "La suscripción fue reactivada con los nuevos datos.";

    /** Mensaje cuando se cancela una suscripción que ya estaba inactiva. */
    public static final String ERROR_SUSCRIPCION_YA_CANCELADA =
            "La suscripción ya se encuentra cancelada.";

    private SuscripcionSmsConstants() {
        // Clase de utilidad, no instanciable.
    }
}

package bo.edu.sos.backend.constants;

import java.util.List;
import java.util.Map;

/**
 * Estados de los voluntariados.
 *
 * Transiciones permitidas:
 *   BORRADOR  → PUBLICADO, CANCELADO
 *   PUBLICADO → CERRADO, CANCELADO, BORRADOR
 *   CERRADO   → ARCHIVADO
 *   CANCELADO → ARCHIVADO
 *   ARCHIVADO → (estado final)
 */
public final class EstadoVoluntariado {

    public static final String BORRADOR   = "BORRADOR";
    public static final String PUBLICADO  = "PUBLICADO";
    public static final String CERRADO    = "CERRADO";
    public static final String CANCELADO  = "CANCELADO";
    public static final String ARCHIVADO  = "ARCHIVADO";

    public static final List<String> VALORES =
            List.of(BORRADOR, PUBLICADO, CERRADO, CANCELADO, ARCHIVADO);

    private static final Map<String, List<String>> TRANSICIONES = Map.of(
            BORRADOR,  List.of(PUBLICADO, CANCELADO),
            PUBLICADO, List.of(CERRADO, CANCELADO, BORRADOR),
            CERRADO,   List.of(ARCHIVADO),
            CANCELADO, List.of(ARCHIVADO),
            ARCHIVADO, List.of()
    );

    public static boolean esValido(String estado) {
        return estado != null && VALORES.contains(estado);
    }

    public static boolean transicionPermitida(String actual, String nuevo) {
        if (!esValido(actual) || !esValido(nuevo)) {
            return false;
        }
        return TRANSICIONES.getOrDefault(actual, List.of()).contains(nuevo);
    }

    public static boolean puedePublicarse(String estado) {
        return PUBLICADO.equals(estado);
    }

    private EstadoVoluntariado() {}
}
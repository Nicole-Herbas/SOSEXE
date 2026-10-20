package bo.edu.sos.backend.constants;

import java.util.List;
import java.util.Map;

/**
 * Estados de las alertas de emergencia.
 *
 * Transiciones permitidas:
 *   BORRADOR  → ACTIVA, CANCELADA
 *   ACTIVA    → EXPIRADA, CANCELADA
 *   EXPIRADA  → (estado final)
 *   CANCELADA → (estado final)
 */
public final class EstadoAlerta {

    public static final String BORRADOR   = "BORRADOR";
    public static final String ACTIVA     = "ACTIVA";
    public static final String EXPIRADA   = "EXPIRADA";
    public static final String CANCELADA  = "CANCELADA";

    public static final List<String> VALORES =
            List.of(BORRADOR, ACTIVA, EXPIRADA, CANCELADA);

    private static final Map<String, List<String>> TRANSICIONES = Map.of(
            BORRADOR,  List.of(ACTIVA, CANCELADA),
            ACTIVA,    List.of(EXPIRADA, CANCELADA),
            EXPIRADA,  List.of(),
            CANCELADA, List.of()
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

    public static boolean esVisible(String estado) {
        return ACTIVA.equals(estado);
    }

    private EstadoAlerta() {}
}
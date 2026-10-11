package bo.edu.sos.backend.constants;

import java.util.List;

/**
 * Estados de postulación a voluntariados.
 */
public final class EstadoPostulacion {

    public static final String PENDIENTE = "PENDIENTE";
    public static final String APROBADO  = "APROBADO";
    public static final String RECHAZADO = "RECHAZADO";

    public static final List<String> VALORES =
            List.of(PENDIENTE, APROBADO, RECHAZADO);

    public static boolean esValido(String estado) {
        return estado != null && VALORES.contains(estado);
    }

    private EstadoPostulacion() {}
}
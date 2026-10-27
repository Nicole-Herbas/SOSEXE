package bo.edu.sos.backend.constants;

import java.util.List;

/**
 * Estados de verificación usados en Centro y PuntoAyuda.
 */
public final class EstadoVerificacion {

    public static final String PENDIENTE    = "PENDIENTE";
    public static final String EN_REVISION  = "EN_REVISION";
    public static final String VERIFICADO   = "VERIFICADO";
    public static final String RECHAZADO    = "RECHAZADO";

    public static final List<String> VALORES =
            List.of(PENDIENTE, EN_REVISION, VERIFICADO, RECHAZADO);

    public static boolean esValido(String estado) {
        return estado != null && VALORES.contains(estado);
    }

    public static boolean puedePublicarse(String estado) {
        return VERIFICADO.equals(estado);
    }

    private EstadoVerificacion() {}
}
package bo.edu.sos.backend.constants;

import java.util.List;

/**
 * Estados de verificación usados en Centro y PuntoAyuda.
 * Reglas de publicación:
 *  - PENDIENTE: recién creado, aún no revisado.
 *  - EN_REVISION: un administrador lo tomó para revisión.
 *  - VERIFICADO: aprobado, se publica en el mapa.
 *  - RECHAZADO: no cumple, no se publica.
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

    /** Regla de publicación: solo VERIFICADO se publica en el mapa. */
    public static boolean puedePublicarse(String estado) {
        return VERIFICADO.equals(estado);
    }

    private EstadoVerificacion() {}
}
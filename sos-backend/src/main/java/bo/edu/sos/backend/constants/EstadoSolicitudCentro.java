package bo.edu.sos.backend.constants;

import java.util.Set;

/**
 * Estados de una solicitud de registro de centro (SOS-41 / SOS-43).
 */
public final class EstadoSolicitudCentro {

    /** Recién enviada por el representante, esperando revisión. */
    public static final String PENDIENTE           = "PENDIENTE";

    /** El administrador la aprobó. */
    public static final String APROBADA            = "APROBADA";

    /** El administrador la rechazó (con motivo). */
    public static final String RECHAZADA           = "RECHAZADA";

    /** El administrador pidió corregir o completar información. */
    public static final String CAMBIOS_SOLICITADOS = "CAMBIOS_SOLICITADOS";

    /** Todos los estados válidos. */
    public static final Set<String> TODOS =
            Set.of(PENDIENTE, APROBADA, RECHAZADA, CAMBIOS_SOLICITADOS);

    /** Estados que el administrador puede asignar al revisar. */
    public static final Set<String> RESULTADOS_REVISION =
            Set.of(APROBADA, RECHAZADA, CAMBIOS_SOLICITADOS);

    /** Estados que exigen escribir una observación. */
    public static final Set<String> REQUIEREN_OBSERVACION =
            Set.of(RECHAZADA, CAMBIOS_SOLICITADOS);

    private EstadoSolicitudCentro() {}
}
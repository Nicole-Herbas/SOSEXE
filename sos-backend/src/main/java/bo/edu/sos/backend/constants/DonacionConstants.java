package bo.edu.sos.backend.constants;

/**
 * Constantes específicas del módulo Donación.
 */
public final class DonacionConstants {

    /** Prefijo del código único generado para cada donación (e.g. DON-A1B2C3D4). */
    public static final String CODIGO_PREFIJO = "DON-";

    /** Longitud del sufijo UUID aleatorio del código (sin guiones). */
    public static final int CODIGO_SUFIJO_LONGITUD = 8;

    private DonacionConstants() {}
}

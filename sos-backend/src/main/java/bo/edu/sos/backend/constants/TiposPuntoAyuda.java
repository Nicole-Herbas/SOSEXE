package bo.edu.sos.backend.constants;

/**
 * Tipos que puede registrar un ciudadano en SOS-49.
 * Los centros y refugios se registran por SOS-41.
 */
public final class TiposPuntoAyuda {

    public static final String PUNTO_DONACION = MapaConstants.TIPO_PUNTO_DONACION;
    public static final String PUNTO_ENTREGA = "PUNTO_ENTREGA";
    public static final String OTRO = "OTRO";

    public static final String REGEX_CIUDADANO =
            "^(PUNTO_DONACION|PUNTO_ENTREGA|OTRO)$";

    private TiposPuntoAyuda() {}
}

package bo.edu.sos.backend.constants;

/**
 * Estado de envío de SMS — usado en EnvioSms.
 */
public final class EstadoEnvioSms {

    public static final String PENDIENTE = "PENDIENTE";
    public static final String ENVIADO   = "ENVIADO";
    public static final String FALLIDO   = "FALLIDO";

    private EstadoEnvioSms() {}
}

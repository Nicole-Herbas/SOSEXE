package bo.edu.sos.backend.constants;

import java.util.List;

public final class NoticiaConstants {

    public static final String ESTADO_BORRADOR  = "BORRADOR";
    public static final String ESTADO_PUBLICADO = "PUBLICADO";
    public static final String ESTADO_ARCHIVADO = "ARCHIVADO";
    public static final String ESTADO_DESPUBLICADA = "DESPUBLICADA";

    public static final List<String> ESTADOS_VALIDOS =
            List.of(ESTADO_BORRADOR, ESTADO_PUBLICADO, ESTADO_ARCHIVADO, ESTADO_DESPUBLICADA);

    public static boolean esValido(String estado) {
        return estado != null && ESTADOS_VALIDOS.contains(estado);
    }

    public static boolean transicionPermitida(String actual, String nuevo) {
        if (!esValido(actual) || !esValido(nuevo) || actual.equals(nuevo)) return false;

        return switch (actual) {
            case ESTADO_BORRADOR -> nuevo.equals(ESTADO_PUBLICADO);
            case ESTADO_PUBLICADO -> nuevo.equals(ESTADO_DESPUBLICADA) || nuevo.equals(ESTADO_ARCHIVADO);
            case ESTADO_DESPUBLICADA -> nuevo.equals(ESTADO_PUBLICADO) || nuevo.equals(ESTADO_ARCHIVADO);
            default -> false;
        };
    }

    public static final String CAT_INCENDIOS = "Incendios";
    public static final String CAT_INUNDACIONES = "Inundaciones";
    public static final String CAT_DESLIZAMIENTOS = "Deslizamientos";
    public static final String CAT_SEQUIAS = "Sequias";
    public static final String CAT_COMUNIDAD = "Comunidad";
    public static final String CAT_ALERTAS = "Alertas";

    public static final String API_EXTERNA_BASE_URL = "https://newsdata.io/api/1/latest";
    public static final String API_EXTERNA_QUERY = "Bolivia";
    public static final String API_EXTERNA_LANG = "es";
    public static final long CACHE_DURACION_MS = 15L * 60L * 1_000L;
    public static final String LOG_API_EXTERNA_FALLO = "Falló la consulta a newsdata.io (tipo de error: {}).";

    private NoticiaConstants() {}
}
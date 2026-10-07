package bo.edu.sos.backend.constants;

/**
 * Constantes del módulo Noticias.
 *
 * <h2>Responsabilidades</h2>
 * <ul>
 *   <li>Estados del ciclo de vida de una noticia.</li>
 *   <li>Categorías reconocidas por el sistema (deben coincidir con los
 *       filtros de la página de Noticias del frontend).</li>
 *   <li>Configuración de la API externa de noticias (newsdata.io).</li>
 *   <li>Duración del caché en memoria para llamadas externas.</li>
 * </ul>
 */
public final class NoticiaConstants {

    // ── Estados del ciclo de vida ────────────────────────────────────────────
    /** La noticia aún no está lista para publicarse. */
    public static final String ESTADO_BORRADOR  = "BORRADOR";

    /** La noticia está visible para todos los usuarios (pública). */
    public static final String ESTADO_PUBLICADO = "PUBLICADO";

    /** La noticia ya no es vigente pero se conserva en el histórico. */
    public static final String ESTADO_ARCHIVADO = "ARCHIVADO";

    // ── Categorías (coinciden con los filtros del frontend) ──────────────────
    public static final String CAT_INCENDIOS      = "Incendios";
    public static final String CAT_INUNDACIONES   = "Inundaciones";
    public static final String CAT_DESLIZAMIENTOS = "Deslizamientos";
    public static final String CAT_SEQUIAS        = "Sequias";
    public static final String CAT_COMUNIDAD      = "Comunidad";
    public static final String CAT_ALERTAS        = "Alertas";

    // ── API Externa — newsdata.io ────────────────────────────────────────────
    /** URL base de la API de noticias externas. */
    public static final String API_EXTERNA_BASE_URL =
            "https://newsdata.io/api/1/latest";

    /** Término de búsqueda por defecto para la API externa. */
    public static final String API_EXTERNA_QUERY = "Bolivia";

    /** Código de idioma para filtrar resultados (español). */
    public static final String API_EXTERNA_LANG = "es";

    // ── Caché en memoria ─────────────────────────────────────────────────────
    /** Duración del caché de noticias externas: 15 minutos. */
    public static final long CACHE_DURACION_MS = 15L * 60L * 1_000L;

        /** Mensaje sanitizado para fallos de la API externa; no registrar su URL ni API key. */
        public static final String LOG_API_EXTERNA_FALLO =
            "Falló la consulta a newsdata.io (tipo de error: {}).";

    private NoticiaConstants() {}
}

package bo.edu.sos.backend.constants;

/**
 * Rutas base de la API REST.
 * Cada constante representa el prefijo de un controlador.
 */
public final class ApiRoutes {

    // ── Auth ────────────────────────────────────────────────────────────────
    public static final String AUTH           = "/api/auth";
    public static final String AUTH_REGISTRO  = AUTH + "/registro";
    public static final String AUTH_LOGIN     = AUTH + "/login";
    public static final String AUTH_REFRESH   = AUTH + "/refresh";
    public static final String AUTH_LOGOUT    = AUTH + "/logout";
    public static final String AUTH_ME        = AUTH + "/me";

    // ── Centros ──────────────────────────────────────────────────────────────
    public static final String CENTROS        = "/api/centros";

    // ── Noticias ─────────────────────────────────────────────────────────────
    public static final String NOTICIAS       = "/api/noticias";

    // ── Alertas ──────────────────────────────────────────────────────────────
    public static final String ALERTAS        = "/api/alertas";

    // ── Puntos de ayuda ───────────────────────────────────────────────────────
    public static final String PUNTOS_AYUDA   = "/api/puntos-ayuda";

    // ── Voluntariados ─────────────────────────────────────────────────────────
    public static final String VOLUNTARIADOS  = "/api/voluntariados";

    // ── Postulaciones ─────────────────────────────────────────────────────────
    public static final String POSTULACIONES  = "/api/postulaciones";

    // ── Donaciones ────────────────────────────────────────────────────────────
    public static final String DONACIONES     = "/api/donaciones";

    // ── Usuarios ──────────────────────────────────────────────────────────────
    public static final String USUARIOS       = "/api/usuarios";

    // ── Mapa ──────────────────────────────────────────────────────────────────
    public static final String MAPA           = "/api/mapa";
    public static final String MAPA_PUNTOS    = MAPA + "/puntos";

    // ── Swagger / OpenAPI ─────────────────────────────────────────────────────
    public static final String SWAGGER_UI     = "/swagger-ui/**";
    public static final String SWAGGER_HTML   = "/swagger-ui.html";
    public static final String OPENAPI_DOCS   = "/v3/api-docs/**";

    private ApiRoutes() {}
}

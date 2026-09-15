package bo.edu.sos.backend.constants;

/**
 * Constantes de la capa de autenticación.
 * Centraliza todos los mensajes y valores literales usados en AuthService y AuthController.
 */
public final class AuthConstants {

    private AuthConstants() {
        // Clase utilitaria, no instanciar
    }

    // ── Mensajes de error ──────────────────────────────────────────────────
    public static final String EMAIL_YA_REGISTRADO     = "El correo ya está registrado";
    public static final String CREDENCIALES_INCORRECTAS = "Credenciales incorrectas";

    // ── Mensajes de éxito ──────────────────────────────────────────────────
    public static final String REGISTRO_EXITOSO = "¡Usuario registrado con éxito!";

    // ── Token ──────────────────────────────────────────────────────────────
    public static final String TOKEN_PREFIX = "jwt-generado-exitosamente-para-";
    public static final String TIPO_TOKEN   = "Bearer";

    // ── Roles ──────────────────────────────────────────────────────────────
    public static final Long ROL_CIUDADANO_ID = 2L;
}

package bo.edu.sos.backend.constants;

/**
 * Claims incluidos en el JWT generado por JwtService.
 */
public final class JwtClaims {

    /** Claim que contiene el ID del usuario autenticado. */
    public static final String USUARIO_ID = "usuarioId";

    /** Claim que contiene el nombre del rol del usuario. */
    public static final String ROL = "rol";

    private JwtClaims() {}
}

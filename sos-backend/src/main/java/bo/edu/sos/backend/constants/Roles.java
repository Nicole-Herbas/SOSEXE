package bo.edu.sos.backend.constants;

/**
 * Roles de usuario del sistema.
 * Deben coincidir exactamente con los valores en la tabla `rol` de la base de datos.
 */
public final class Roles {

    /** Rol de administrador — puede crear, editar y eliminar cualquier entidad. */
    public static final String ADMIN     = "ADMIN";

    /** Rol de usuario estándar — puede donar y postularse a voluntariados. */
    public static final String USER      = "USER";

    /** Rol de voluntario — reservado para uso futuro. */
    public static final String VOLUNTARIO = "VOLUNTARIO";

    private Roles() {}
}

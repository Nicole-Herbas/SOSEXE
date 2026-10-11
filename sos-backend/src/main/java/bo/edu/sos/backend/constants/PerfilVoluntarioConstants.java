package bo.edu.sos.backend.constants;

import java.util.List;

/**
 * Constantes del módulo Perfil de Voluntario (SOS-40).
 */
public final class PerfilVoluntarioConstants {

    /** Habilidades predefinidas que se muestran en el formulario. */
    public static final List<String> HABILIDADES_VALIDAS = List.of(
            "Primeros auxilios",
            "Organización",
            "Transporte",
            "Comunicación",
            "Apoyo comunitario",
            "Rescate animal",
            "Logística"
    );

    /** Opciones de disponibilidad predefinidas. */
    public static final List<String> DISPONIBILIDADES_VALIDAS = List.of(
            "Días de semana",
            "Fines de semana",
            "Respuesta de emergencia",
            "Mañana",
            "Tarde",
            "Noche"
    );

    private PerfilVoluntarioConstants() {}
}

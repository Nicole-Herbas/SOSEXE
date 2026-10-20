package bo.edu.sos.backend.constants;

import java.util.List;

public final class SeveridadAlerta {

    public static final String BAJA    = "BAJA";
    public static final String MEDIA   = "MEDIA";
    public static final String ALTA    = "ALTA";
    public static final String CRITICA = "CRITICA";

    public static final List<String> VALORES =
            List.of(BAJA, MEDIA, ALTA, CRITICA);

    public static boolean esValida(String severidad) {
        return severidad != null && VALORES.contains(severidad);
    }

    private SeveridadAlerta() {}
}
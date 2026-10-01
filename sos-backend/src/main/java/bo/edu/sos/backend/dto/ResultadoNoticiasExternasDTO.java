package bo.edu.sos.backend.dto;

import java.util.List;

/** Resultado de la consulta externa con disponibilidad explícita de newsdata.io. */
public record ResultadoNoticiasExternasDTO(
        List<NoticiaExternaDTO> noticias,
        boolean apiDisponible,
        boolean desdeCache) {

    public ResultadoNoticiasExternasDTO {
        noticias = List.copyOf(noticias);
    }
}
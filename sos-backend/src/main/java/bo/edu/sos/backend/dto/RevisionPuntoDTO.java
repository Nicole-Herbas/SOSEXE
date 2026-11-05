package bo.edu.sos.backend.dto;

import bo.edu.sos.backend.constants.RevisionPuntoConstants;
import jakarta.validation.constraints.Size;

/** Solo los datos editables de la decisión, nunca los del punto registrado. */
public record RevisionPuntoDTO(
        @Size(max = RevisionPuntoConstants.MOTIVO_MAX_CARACTERES,
                message = "El motivo no puede superar 500 caracteres") String motivo) {
}

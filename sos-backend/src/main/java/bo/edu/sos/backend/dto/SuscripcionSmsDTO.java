package bo.edu.sos.backend.dto;

import bo.edu.sos.backend.constants.SuscripcionSmsConstants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO para crear y consultar suscripciones SMS.
 */
@Getter
@Setter
@NoArgsConstructor
public class SuscripcionSmsDTO {

    /** Campos de respuesta. */
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;

    @NotNull(message = SuscripcionSmsConstants.ERROR_DEPARTAMENTO_REQUERIDO)
    private Long departamentoId;

    private String departamentoNombre;

    @NotBlank(message = SuscripcionSmsConstants.ERROR_TELEFONO_REQUERIDO)
    @Pattern(
            regexp = SuscripcionSmsConstants.REGEX_TELEFONO,
            message = SuscripcionSmsConstants.ERROR_TELEFONO_FORMATO
    )
    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    private String telefono;

    private Boolean activa;
    private LocalDateTime consentimientoFecha;
}

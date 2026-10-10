package bo.edu.sos.backend.dto;

import bo.edu.sos.backend.constants.SuscripcionSmsConstants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO de transferencia para la suscripción a alertas SMS (SOS-63).
 *
 * Los campos de solo lectura (activa, consentimientoFecha, departamentoNombre)
 * se rellenan en la respuesta y se ignoran en la entrada.
 */
@Getter
@Setter
@NoArgsConstructor
public class SuscripcionSmsDTO {

    /** ID del departamento seleccionado. Obligatorio en la petición. */
    @NotNull(message = SuscripcionSmsConstants.ERROR_DEPARTAMENTO_REQUERIDO)
    private Long departamentoId;

    /** Nombre del departamento — solo en respuesta. */
    private String departamentoNombre;

    /** Número de teléfono del suscriptor. */
    @NotBlank(message = SuscripcionSmsConstants.ERROR_TELEFONO_REQUERIDO)
    @Pattern(
            regexp  = SuscripcionSmsConstants.REGEX_TELEFONO,
            message = SuscripcionSmsConstants.ERROR_TELEFONO_FORMATO
    )
    private String telefono;

    /** Indica si la suscripción está activa — solo en respuesta. */
    private Boolean activa;

    /** Fecha y hora en que se registró el consentimiento — solo en respuesta. */
    private LocalDateTime consentimientoFecha;
}

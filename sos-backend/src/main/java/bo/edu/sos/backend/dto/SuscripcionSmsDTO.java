package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class SuscripcionSmsDTO {

    private Long id;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    private String telefono;

    @NotNull(message = "El departamento es obligatorio")
    private Long departamentoId;

    private String departamentoNombre;

    private Long usuarioId;

    private String usuarioNombre;

    private Boolean activa;

    private LocalDateTime consentimientoFecha;
}
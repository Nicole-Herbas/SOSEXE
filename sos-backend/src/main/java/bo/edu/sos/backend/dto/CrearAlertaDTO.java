package bo.edu.sos.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CrearAlertaDTO {
    @NotBlank(message = "El título es obligatorio")
    @Size(max = 220, message = "El título no puede superar los 220 caracteres")
    private String titulo;

    @NotNull(message = "El departamento es obligatorio")
    @Positive(message = "El departamento debe ser válido")
    private Long departamentoId;

    @NotBlank(message = "La severidad es obligatoria")
    @Pattern(regexp = "BAJA|MEDIA|ALTA|CRITICA", message = "La severidad debe ser BAJA, MEDIA, ALTA o CRITICA")
    private String severidad;

    @NotBlank(message = "El mensaje es obligatorio")
    @Size(max = 1000, message = "El mensaje no puede superar los 1000 caracteres")
    private String mensaje;

    @NotNull(message = "El inicio de vigencia es obligatorio")
    private LocalDateTime fechaPublicacion;

    @NotNull(message = "El fin de vigencia es obligatorio")
    private LocalDateTime fechaExpiracion;

    @NotBlank(message = "La fuente es obligatoria")
    @Size(max = 250, message = "La fuente no puede superar los 250 caracteres")
    private String fuente;

    @JsonIgnore
    @AssertTrue(message = "El fin de vigencia debe ser posterior al inicio")
    public boolean isVigenciaValida() {
        return fechaPublicacion == null || fechaExpiracion == null
                || fechaExpiracion.isAfter(fechaPublicacion);
    }
}

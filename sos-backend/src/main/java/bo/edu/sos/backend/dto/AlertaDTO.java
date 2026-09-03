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
public class AlertaDTO {

    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 220, message = "El título no puede superar los 220 caracteres")
    private String titulo;

    @NotBlank(message = "El mensaje es obligatorio")
    @Size(max = 1000, message = "El mensaje no puede superar los 1000 caracteres")
    private String mensaje;

    @NotBlank(message = "La severidad es obligatoria")
    @Size(max = 30, message = "La severidad no puede superar los 30 caracteres")
    private String severidad;

    private LocalDateTime fechaPublicacion;

    private LocalDateTime fechaExpiracion;

    private String estado;

    @NotNull(message = "El departamento es obligatorio")
    private Long departamentoId;

    @NotNull(message = "El creador es obligatorio")
    private Long creadoPorId;

    private String departamentoNombre;
}

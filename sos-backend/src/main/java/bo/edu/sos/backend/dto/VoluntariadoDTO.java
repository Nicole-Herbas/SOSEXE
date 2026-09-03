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
public class VoluntariadoDTO {

    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 180, message = "El título no puede superar los 180 caracteres")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDateTime fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDateTime fechaFin;

    @Size(max = 500, message = "Las habilidades no pueden superar los 500 caracteres")
    private String habilidadesRequeridas;

    private String estado;

    @NotNull(message = "El centro es obligatorio")
    private Long centroId;

    @NotNull(message = "El creador es obligatorio")
    private Long creadoPorId;

    private String centroNombre;
}

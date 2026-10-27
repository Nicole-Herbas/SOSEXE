package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AlertaDTO extends CrearAlertaDTO {

    private Long id;

    @NotNull(message = "Debes revisar la versión actual antes de editar")
    @PositiveOrZero(message = "La versión debe ser válida")
    private Long version;

    private String estado;

    @NotNull(message = "El creador es obligatorio")
    private Long creadoPorId;

    private String departamentoNombre;
}

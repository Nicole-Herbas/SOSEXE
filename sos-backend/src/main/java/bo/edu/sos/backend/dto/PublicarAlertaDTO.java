package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PublicarAlertaDTO {
    @NotNull(message = "Debes confirmar la publicación")
    @AssertTrue(message = "Debes confirmar la publicación")
    private Boolean confirmado;

    @NotNull(message = "Debes revisar la alerta antes de publicarla")
    @PositiveOrZero(message = "La versión revisada debe ser válida")
    private Long version;
}

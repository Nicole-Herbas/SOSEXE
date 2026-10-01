package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * SOS-43: cuerpo del PATCH /api/solicitudes-centro/{id}/estado
 * Ejemplo: { "estado": "RECHAZADA", "observacion": "El NIT no coincide" }
 */
@Getter
@Setter
@NoArgsConstructor
public class CambiarEstadoSolicitudDTO {

    @NotBlank(message = "El estado es obligatorio")
    private String estado;

    @Size(max = 1000, message = "La observación no puede superar los 1000 caracteres")
    private String observacion;
}
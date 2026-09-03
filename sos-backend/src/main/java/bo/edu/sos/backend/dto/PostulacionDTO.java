package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class PostulacionDTO {

    private Long id;

    @NotNull(message = "El voluntariado es obligatorio")
    private Long voluntariadoId;

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;

    private LocalDateTime fechaPostulacion;

    private String estado;

    @Size(max = 255, message = "La disponibilidad no puede superar los 255 caracteres")
    private String disponibilidad;

    @Size(max = 500, message = "El comentario no puede superar los 500 caracteres")
    private String comentario;

    private String voluntariadoTitulo;

    private String usuarioNombre;
}

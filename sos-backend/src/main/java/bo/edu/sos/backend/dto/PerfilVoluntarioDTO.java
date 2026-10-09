package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PerfilVoluntarioDTO {

    private Long id;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    private String telefono;

    @NotBlank(message = "El correo de contacto es obligatorio")
    @Email(message = "El correo de contacto no tiene un formato válido")
    @Size(max = 150, message = "El correo no puede superar los 150 caracteres")
    private String emailContacto;

    @NotNull(message = "El departamento es obligatorio")
    private Long departamentoId;

    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 100, message = "La ciudad no puede superar los 100 caracteres")
    private String ciudad;

    @NotEmpty(message = "Selecciona al menos una habilidad")
    private List<String> habilidades;

    @NotEmpty(message = "Selecciona al menos una disponibilidad")
    private List<String> disponibilidad;

    // Campos de solo lectura (se llenan en la respuesta)
    private String nombreUsuario;
    private String emailUsuario;
    private String departamentoNombre;
}

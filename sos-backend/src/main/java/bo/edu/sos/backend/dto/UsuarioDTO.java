package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UsuarioDTO {

    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar los 120 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    @Size(max = 150, message = "El email no puede superar los 150 caracteres")
    private String email;

    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    @Size(max = 255, message = "La contraseña no puede superar los 255 caracteres")
    private String password;

    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    private String telefono;

    private Long departamentoId;

    @NotNull(message = "El rol es obligatorio")
    private Long rolId;

    private Boolean activo;

    private String rolNombre;

    private String departamentoNombre;
}

package bo.edu.sos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String tipoToken = "Bearer";
    private String nombre;
    private String email;
    private String rol;

    // Constructor personalizado sin el tipoToken para que sea más fácil de instanciar
    public AuthResponseDTO(String token, String nombre, String email, String rol) {
        this.token = token;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
    }
}
package bo.edu.sos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioAutenticadoDTO {

    private String nombre;
    private String email;
    private String rol;
}
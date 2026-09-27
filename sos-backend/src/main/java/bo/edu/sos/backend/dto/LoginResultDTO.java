package bo.edu.sos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResultDTO {

    private AuthResponseDTO respuesta;

    private String refreshToken;
}
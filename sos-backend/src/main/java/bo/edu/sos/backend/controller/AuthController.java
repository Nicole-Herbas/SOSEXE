package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.AuthResponseDTO;
import bo.edu.sos.backend.dto.LoginRequestDTO;
import bo.edu.sos.backend.dto.RegistroRequestDTO;
import bo.edu.sos.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(
            @Valid @RequestBody RegistroRequestDTO request) {

        authService.registrar(request);

        return ResponseEntity.ok(
                "¡Usuario registrado con éxito!"
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequestDTO request) {

        Optional<AuthResponseDTO> respuesta =
                authService.login(request);

        if (respuesta.isEmpty()) {
            return ResponseEntity
                    .status(401)
                    .body("Credenciales incorrectas");
        }

        return ResponseEntity.ok(
                respuesta.get()
        );
    }
}
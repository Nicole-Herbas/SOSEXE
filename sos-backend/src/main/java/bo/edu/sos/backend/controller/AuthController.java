package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.AuthConstants;
import bo.edu.sos.backend.dto.AuthResponseDTO;
import bo.edu.sos.backend.dto.LoginRequestDTO;
import bo.edu.sos.backend.dto.RegistroRequestDTO;
import bo.edu.sos.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de autenticación.
 * Recibe peticiones HTTP y delega la lógica al AuthService.
 * Arquitectura: Controller → Service → Repository
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    public ResponseEntity<String> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        authService.registrar(request);
        return ResponseEntity.ok(AuthConstants.REGISTRO_EXITOSO);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO respuesta = authService.login(request);
        return ResponseEntity.ok(respuesta);
    }
}
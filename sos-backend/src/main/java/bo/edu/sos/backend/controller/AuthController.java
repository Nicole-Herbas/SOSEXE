package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.AuthResponseDTO;
import bo.edu.sos.backend.dto.LoginRequestDTO;
import bo.edu.sos.backend.dto.LoginResultDTO;
import bo.edu.sos.backend.dto.RegistroRequestDTO;
import bo.edu.sos.backend.dto.UsuarioAutenticadoDTO;
import bo.edu.sos.backend.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Optional;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;


    public AuthController(
            AuthService authService) {

        this.authService =
                authService;
    }


    @PostMapping("/registro")
    public ResponseEntity<?> registrar(
            @Valid
            @RequestBody
            RegistroRequestDTO request) {

        authService.registrar(request);

        return ResponseEntity.ok(
                "¡Usuario registrado con éxito!"
        );
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid
            @RequestBody
            LoginRequestDTO request) {

        Optional<LoginResultDTO> resultado =
                authService.login(request);


        if (resultado.isEmpty()) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Credenciales incorrectas"
                    );
        }


        LoginResultDTO loginResult =
                resultado.get();


        ResponseCookie refreshCookie =
                ResponseCookie
                        .from(
                                "refreshToken",
                                loginResult.getRefreshToken()
                        )
                        .httpOnly(true)
                        .secure(false)
                        .sameSite("Strict")
                        .path("/api/auth")
                        .maxAge(
                                Duration.ofDays(7)
                        )
                        .build();


        AuthResponseDTO respuesta =
                loginResult.getRespuesta();


        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshCookie.toString()
                )
                .body(respuesta);
    }


    @GetMapping("/me")
    public ResponseEntity<UsuarioAutenticadoDTO> me(
            Authentication authentication) {

        return ResponseEntity.ok(
                authService.obtenerUsuarioAutenticado(
                        authentication.getName()
                )
        );
    }
}
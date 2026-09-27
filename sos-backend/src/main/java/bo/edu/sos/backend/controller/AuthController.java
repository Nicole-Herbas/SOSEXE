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

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(
                    name = "refreshToken",
                    required = false
            )
            String refreshToken) {


        if (refreshToken == null ||
                refreshToken.isBlank()) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Refresh token no disponible"
                    );
        }


        Optional<LoginResultDTO> resultado =
                authService.refrescar(
                        refreshToken
                );


        if (resultado.isEmpty()) {

            ResponseCookie cookieVacia =
                    ResponseCookie
                            .from(
                                    "refreshToken",
                                    ""
                            )
                            .httpOnly(true)
                            .secure(false)
                            .sameSite("Strict")
                            .path("/api/auth")
                            .maxAge(0)
                            .build();


            return ResponseEntity
                    .status(401)
                    .header(
                            HttpHeaders.SET_COOKIE,
                            cookieVacia.toString()
                    )
                    .body(
                            "Refresh token inválido o expirado"
                    );
        }


        LoginResultDTO loginResult =
                resultado.get();


        ResponseCookie nuevaCookie =
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


        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        nuevaCookie.toString()
                )
                .body(
                        loginResult.getRespuesta()
                );
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

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(
                    name = "refreshToken",
                    required = false
            )
            String refreshToken) {

        authService.logout(
                refreshToken
        );


        ResponseCookie cookieVacia =
                ResponseCookie
                        .from(
                                "refreshToken",
                                ""
                        )
                        .httpOnly(true)
                        .secure(false)
                        .sameSite("Strict")
                        .path("/api/auth")
                        .maxAge(0)
                        .build();


        return ResponseEntity
                .noContent()
                .header(
                        HttpHeaders.SET_COOKIE,
                        cookieVacia.toString()
                )
                .build();
    }
}
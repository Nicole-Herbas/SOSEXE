package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.SuscripcionSmsDTO;
import bo.edu.sos.backend.service.SuscripcionSmsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suscripciones-sms")
public class SuscripcionSmsController {

    private final SuscripcionSmsService suscripcionSmsService;

    public SuscripcionSmsController(SuscripcionSmsService suscripcionSmsService) {
        this.suscripcionSmsService = suscripcionSmsService;
    }

    @GetMapping("/mia")
    public ResponseEntity<ApiResponse<SuscripcionSmsDTO>> obtenerMia(
            Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        suscripcionSmsService.obtenerMia(authentication.getName())
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SuscripcionSmsDTO>> suscribir(
            @Valid @RequestBody SuscripcionSmsDTO dto,
            Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Suscripción SMS registrada",
                        suscripcionSmsService.suscribir(
                                dto,
                                authentication.getName()
                        )
                )
        );
    }

    @PatchMapping("/estado")
    public ResponseEntity<ApiResponse<SuscripcionSmsDTO>> cambiarEstado(
            @RequestParam boolean activa,
            Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Estado de suscripción actualizado",
                        suscripcionSmsService.cambiarEstado(
                                activa,
                                authentication.getName()
                        )
                )
        );
    }
}
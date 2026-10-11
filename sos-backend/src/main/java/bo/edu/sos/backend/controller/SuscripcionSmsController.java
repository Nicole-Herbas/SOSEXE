package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.SuscripcionSmsDTO;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.service.SuscripcionSmsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para la suscripción a alertas SMS (SOS-63).
 *
 * Ambos prefijos se conservan para mantener compatibilidad con consumidores
 * existentes. Los endpoints requieren autenticación JWT.
 */
@RestController
public class SuscripcionSmsController {

    private final SuscripcionSmsService suscripcionService;


    public SuscripcionSmsController(SuscripcionSmsService suscripcionService) {
        this.suscripcionService = suscripcionService;
    }

    /**
     * Crea o actualiza la suscripción SMS del usuario autenticado.
     *
     * Si el usuario ya tenía una suscripción (activa o cancelada), se actualiza
     * y reactiva. Si es la primera vez, se crea.
     *
     * POST /api/suscripcion-sms
     */
    @PostMapping(ApiRoutes.SUSCRIPCION_SMS)
    public ResponseEntity<ApiResponse<SuscripcionSmsDTO>> suscribir(
            @Valid @RequestBody SuscripcionSmsDTO dto,
            Authentication authentication) {

        LogHelper.debug(
                SuscripcionSmsController.class,
                "Peticion POST suscripcion-sms recibida. usuario={}",
                authentication.getName()
        );

        SuscripcionSmsDTO resultado =
                suscripcionService.suscribir(
                        authentication.getName(),
                        dto
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(resultado));
    }

    /**
     * Mantiene el contrato anterior de SOS-69 para el prefijo plural.
     */
    @PostMapping(ApiRoutes.SUSCRIPCIONES_SMS)
    public ResponseEntity<ApiResponse<SuscripcionSmsDTO>> suscribirCompatibilidad(
            @Valid @RequestBody SuscripcionSmsDTO dto,
            Authentication authentication) {

        SuscripcionSmsDTO resultado =
                suscripcionService.suscribir(authentication.getName(), dto);

        return ResponseEntity.ok(
                ApiResponse.ok("Suscripción SMS registrada", resultado)
        );
    }

    /**
     * Obtiene la suscripción SMS del usuario autenticado.
     *
     * GET /api/suscripcion-sms/me o /api/suscripciones-sms/mia
     */
    @GetMapping({
            ApiRoutes.SUSCRIPCION_SMS + "/me",
            ApiRoutes.SUSCRIPCIONES_SMS + "/mia"
    })
    public ResponseEntity<ApiResponse<SuscripcionSmsDTO>> obtenerMiSuscripcion(
            Authentication authentication) {

        LogHelper.debug(
                SuscripcionSmsController.class,
                "Peticion GET suscripcion-sms/me recibida. usuario={}",
                authentication.getName()
        );

        SuscripcionSmsDTO dto =
                suscripcionService.obtenerSuscripcion(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                ApiResponse.ok(dto)
        );
    }

    /**
     * Verifica si el usuario autenticado tiene una suscripción registrada.
     */
    @GetMapping(ApiRoutes.SUSCRIPCION_SMS + "/me/existe")
    public ResponseEntity<ApiResponse<Boolean>> existeMiSuscripcion(
            Authentication authentication) {

        LogHelper.debug(
                SuscripcionSmsController.class,
                "Peticion GET suscripcion-sms/me/existe recibida. usuario={}",
                authentication.getName()
        );

        boolean existe =
                suscripcionService.existeSuscripcion(authentication.getName());

        return ResponseEntity.ok(ApiResponse.ok(existe));
    }

    /**
     * Permite al usuario autenticado activar o desactivar su suscripción.
     */
    @PatchMapping({
            ApiRoutes.SUSCRIPCION_SMS + "/estado",
            ApiRoutes.SUSCRIPCIONES_SMS + "/estado"
    })
    public ResponseEntity<ApiResponse<SuscripcionSmsDTO>> cambiarEstado(
            @RequestParam boolean activa,
            Authentication authentication) {

        SuscripcionSmsDTO actualizada = suscripcionService.cambiarEstado(
                activa,
                authentication.getName()
        );

        return ResponseEntity.ok(
                ApiResponse.ok("Estado de suscripción actualizado", actualizada)
        );
    }
}

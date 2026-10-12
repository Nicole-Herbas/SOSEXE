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
 * Endpoints autenticados para administrar la suscripción a alertas SMS.
 */
@RestController
public class SuscripcionSmsController {

    private final SuscripcionSmsService suscripcionService;

    public SuscripcionSmsController(SuscripcionSmsService suscripcionService) {
        this.suscripcionService = suscripcionService;
    }

    /**
     * Crea o actualiza y reactiva la suscripción del usuario autenticado.
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
                suscripcionService.suscribir(authentication.getName(), dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(resultado));
    }

    /**
     * Mantiene el prefijo plural publicado por SOS-69.
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
     * Obtiene los datos de la suscripción del usuario autenticado.
     */
    @GetMapping({
            ApiRoutes.SUSCRIPCION_SMS + "/me",
            ApiRoutes.SUSCRIPCIONES_SMS + "/mia"
    })
    public ResponseEntity<ApiResponse<SuscripcionSmsDTO>> obtenerMiSuscripcion(
            Authentication authentication) {

        LogHelper.debug(
                SuscripcionSmsController.class,
                "Peticion GET de suscripcion SMS recibida. usuario={}",
                authentication.getName()
        );

        return ResponseEntity.ok(
                ApiResponse.ok(
                        suscripcionService.obtenerSuscripcion(authentication.getName())
                )
        );
    }

    /**
     * Indica si el usuario autenticado tiene una suscripción registrada.
     */
    @GetMapping({
            ApiRoutes.SUSCRIPCION_SMS + "/me/existe",
            ApiRoutes.SUSCRIPCIONES_SMS + "/me/existe"
    })
    public ResponseEntity<ApiResponse<Boolean>> existeMiSuscripcion(
            Authentication authentication) {

        boolean existe =
                suscripcionService.existeSuscripcion(authentication.getName());

        return ResponseEntity.ok(ApiResponse.ok(existe));
    }

    /**
     * Cancela sin borrar el registro, para conservar el historial de consentimiento.
     */
    @DeleteMapping({
            ApiRoutes.SUSCRIPCION_SMS + "/me",
            ApiRoutes.SUSCRIPCIONES_SMS + "/mia"
    })
    public ResponseEntity<ApiResponse<Void>> cancelarMiSuscripcion(
            Authentication authentication) {

        LogHelper.debug(
                SuscripcionSmsController.class,
                "Peticion DELETE de suscripcion SMS recibida. usuario={}",
                authentication.getName()
        );

        suscripcionService.cancelar(authentication.getName());

        return ResponseEntity.ok(
                ApiResponse.ok("Suscripción SMS cancelada exitosamente", null)
        );
    }

    /**
     * Mantiene el endpoint de cambio de estado publicado por SOS-69.
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

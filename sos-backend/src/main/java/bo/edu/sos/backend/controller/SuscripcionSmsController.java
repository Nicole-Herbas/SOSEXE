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
 * Todos los endpoints requieren autenticación JWT.
 * La ruta base se define en ApiRoutes.SUSCRIPCION_SMS.
 */
@RestController
@RequestMapping(ApiRoutes.SUSCRIPCION_SMS)
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
    @PostMapping
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
     * Obtiene la suscripción SMS del usuario autenticado.
     *
     * GET /api/suscripcion-sms/me
     */
    @GetMapping("/me")
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
     * Verifica si el usuario autenticado tiene alguna suscripción registrada.
     *
     * GET /api/suscripcion-sms/me/existe
     */
    @GetMapping("/me/existe")
    public ResponseEntity<ApiResponse<Boolean>> existeMiSuscripcion(
            Authentication authentication) {

        LogHelper.debug(
                SuscripcionSmsController.class,
                "Peticion GET suscripcion-sms/me/existe recibida. usuario={}",
                authentication.getName()
        );

        boolean existe =
                suscripcionService.existeSuscripcion(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                ApiResponse.ok(existe)
        );
    }


    /**
     * Cancela la suscripción SMS del usuario autenticado (SOS-64).
     *
     * DELETE /api/suscripcion-sms/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> cancelarMiSuscripcion(
            Authentication authentication) {

        LogHelper.debug(
                SuscripcionSmsController.class,
                "Peticion DELETE suscripcion-sms/me recibida. usuario={}",
                authentication.getName()
        );

        suscripcionService.cancelar(authentication.getName());

        return ResponseEntity.ok(
                ApiResponse.ok("Suscripción SMS cancelada exitosamente", null)
        );
    }
}

package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.PerfilVoluntarioDTO;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.service.PerfilVoluntarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiRoutes.PERFIL_VOLUNTARIO)
public class PerfilVoluntarioController {

    private final PerfilVoluntarioService perfilService;


    public PerfilVoluntarioController(
            PerfilVoluntarioService perfilService) {

        this.perfilService = perfilService;
    }


    @PostMapping
    public ResponseEntity<ApiResponse<PerfilVoluntarioDTO>> crear(
            @Valid @RequestBody PerfilVoluntarioDTO dto,
            Authentication authentication) {

        LogHelper.debug(
                PerfilVoluntarioController.class,
                "Petición para crear perfil de voluntario recibida. usuario={}",
                authentication.getName()
        );

        PerfilVoluntarioDTO creado =
                perfilService.crear(
                        authentication.getName(),
                        dto
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(creado));
    }


    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PerfilVoluntarioDTO>> obtenerMiPerfil(
            Authentication authentication) {

        LogHelper.debug(
                PerfilVoluntarioController.class,
                "Petición para consultar perfil de voluntario recibida. usuario={}",
                authentication.getName()
        );

        PerfilVoluntarioDTO perfil =
                perfilService.obtenerPorUsuario(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                ApiResponse.ok(perfil)
        );
    }


    @PutMapping("/me")
    public ResponseEntity<ApiResponse<PerfilVoluntarioDTO>> actualizarMiPerfil(
            @Valid @RequestBody PerfilVoluntarioDTO dto,
            Authentication authentication) {

        LogHelper.debug(
                PerfilVoluntarioController.class,
                "Petición para actualizar perfil de voluntario recibida. usuario={}",
                authentication.getName()
        );

        PerfilVoluntarioDTO actualizado =
                perfilService.actualizar(
                        authentication.getName(),
                        dto
                );

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Perfil actualizado",
                        actualizado
                )
        );
    }


    @GetMapping("/me/existe")
    public ResponseEntity<ApiResponse<Boolean>> existeMiPerfil(
            Authentication authentication) {

        LogHelper.debug(
                PerfilVoluntarioController.class,
                "Petición para verificar existencia de perfil de voluntario recibida. usuario={}",
                authentication.getName()
        );

        boolean existe =
                perfilService.existePerfil(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                ApiResponse.ok(existe)
        );
    }
}

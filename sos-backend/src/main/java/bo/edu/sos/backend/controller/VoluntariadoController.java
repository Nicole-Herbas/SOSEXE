package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.VoluntariadoDTO;
import bo.edu.sos.backend.service.VoluntariadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/voluntariados")
public class VoluntariadoController {

    private final VoluntariadoService voluntariadoService;

    public VoluntariadoController(VoluntariadoService voluntariadoService) {
        this.voluntariadoService = voluntariadoService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VoluntariadoDTO>>> listarTodos() {
        return ResponseEntity.ok(
                ApiResponse.ok(voluntariadoService.listarTodos()));
    }

    /** Detalle público: las oportunidades no publicadas responden 404. */
    @GetMapping("/publicos/{id}")
    public ResponseEntity<ApiResponse<VoluntariadoDTO>> buscarPublicadaPorId(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok(voluntariadoService.buscarPublicadaPorId(id)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VoluntariadoDTO>> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(voluntariadoService.buscarPorId(id)));
    }

    @GetMapping("/centro/{centroId}")
    public ResponseEntity<ApiResponse<List<VoluntariadoDTO>>> buscarPorCentro(
            @PathVariable Long centroId) {

        return ResponseEntity.ok(
                ApiResponse.ok(voluntariadoService.buscarPorCentro(centroId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VoluntariadoDTO>> crear(
            @Valid @RequestBody VoluntariadoDTO voluntariadoDTO,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        voluntariadoService.guardar(
                                voluntariadoDTO,
                                authentication.getName()
                        )));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoluntariadoDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody VoluntariadoDTO voluntariadoDTO,
            Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Voluntariado actualizado",
                        voluntariadoService.actualizar(
                                id,
                                voluntariadoDTO,
                                authentication.getName()
                        )
                )
        );
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<VoluntariadoDTO>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado,
            Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Estado de voluntariado actualizado",
                        voluntariadoService.cambiarEstado(
                                id,
                                estado,
                                authentication.getName()
                        )
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id,
            Authentication authentication) {

        voluntariadoService.eliminar(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Voluntariado eliminado",
                        null
                )
        );
    }
}
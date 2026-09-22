package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.PostulacionDTO;
import bo.edu.sos.backend.service.PostulacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/postulaciones")
public class PostulacionController {

    private final PostulacionService postulacionService;

    public PostulacionController(PostulacionService postulacionService) {
        this.postulacionService = postulacionService;
    }

    @GetMapping("/voluntariado/{voluntariadoId}")
    public ResponseEntity<ApiResponse<List<PostulacionDTO>>> listarPorVoluntariado(
            @PathVariable Long voluntariadoId,
            Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        postulacionService.listarPorVoluntariado(
                                voluntariadoId,
                                authentication.getName()
                        )
                )
        );
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponse<List<PostulacionDTO>>> listarPorUsuario(
            @PathVariable Long usuarioId) {

        return ResponseEntity.ok(
                ApiResponse.ok(postulacionService
                        .listarPorUsuario(usuarioId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PostulacionDTO>> crear(
            @Valid @RequestBody PostulacionDTO postulacionDTO,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        postulacionService.crear(
                                postulacionDTO,
                                authentication.getName()
                        )));
    }

    @GetMapping("/mias")
    public ResponseEntity<ApiResponse<List<PostulacionDTO>>> listarMias(
            Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        postulacionService.listarPorEmail(
                                authentication.getName()
                        )
                )
        );
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<PostulacionDTO>> actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {

        return ResponseEntity.ok(
                ApiResponse.ok("Estado de postulación actualizado",
                        postulacionService.actualizarEstado(id, estado)));
    }
}

package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.NoticiaDTO;
import bo.edu.sos.backend.dto.ResultadoNoticiasExternasDTO;
import bo.edu.sos.backend.service.NoticiaExternaService;
import bo.edu.sos.backend.service.NoticiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {

    private final NoticiaService noticiaService;
    private final NoticiaExternaService noticiaExternaService;

    public NoticiaController(NoticiaService noticiaService, NoticiaExternaService noticiaExternaService) {
        this.noticiaService = noticiaService;
        this.noticiaExternaService = noticiaExternaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticiaDTO>>> listarTodas() {
        return ResponseEntity.ok(ApiResponse.ok(noticiaService.listarTodas()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticiaDTO>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(noticiaService.buscarPorId(id)));
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<ApiResponse<List<NoticiaDTO>>> buscarPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(ApiResponse.ok(noticiaService.buscarPorCategoria(categoria)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NoticiaDTO>> crear(
            @Valid @RequestBody NoticiaDTO noticiaDTO,
            Authentication authentication) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(noticiaService.guardar(noticiaDTO, authentication.getName())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticiaDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody NoticiaDTO noticiaDTO) {
        return ResponseEntity.ok(ApiResponse.ok("Noticia actualizada", noticiaService.actualizar(id, noticiaDTO)));
    }

        @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<NoticiaDTO>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", noticiaService.cambiarEstado(id, estado)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        noticiaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Noticia eliminada", null));
    }

    @GetMapping("/publicas")
    public ResponseEntity<ApiResponse<List<NoticiaDTO>>> listarPublicadas() {
        return ResponseEntity.ok(ApiResponse.ok(noticiaService.listarPublicadas()));
    }

    @GetMapping("/externas")
    public ResponseEntity<ApiResponse<ResultadoNoticiasExternasDTO>> listarExternas() {
        return ResponseEntity.ok(ApiResponse.ok(noticiaExternaService.obtenerNoticias()));
    }
}
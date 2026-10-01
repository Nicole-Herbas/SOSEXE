package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.NoticiaDTO;
import bo.edu.sos.backend.dto.NoticiaExternaDTO;
import bo.edu.sos.backend.dto.ResultadoNoticiasExternasDTO;
import bo.edu.sos.backend.service.NoticiaExternaService;
import bo.edu.sos.backend.service.NoticiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {

    private final NoticiaService noticiaService;
    private final NoticiaExternaService noticiaExternaService;

    public NoticiaController(
            NoticiaService noticiaService,
            NoticiaExternaService noticiaExternaService) {

        this.noticiaService = noticiaService;
        this.noticiaExternaService = noticiaExternaService;
    }

    // ── Endpoints existentes ─────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticiaDTO>>> listarTodas() {
        return ResponseEntity.ok(
                ApiResponse.ok(noticiaService.listarTodas()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticiaDTO>> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(noticiaService.buscarPorId(id)));
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<ApiResponse<List<NoticiaDTO>>> buscarPorCategoria(
            @PathVariable String categoria) {

        return ResponseEntity.ok(
                ApiResponse.ok(noticiaService.buscarPorCategoria(categoria)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NoticiaDTO>> crear(
            @Valid @RequestBody NoticiaDTO noticiaDTO) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        noticiaService.guardar(noticiaDTO)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticiaDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody NoticiaDTO noticiaDTO) {

        return ResponseEntity.ok(
                ApiResponse.ok("Noticia actualizada",
                        noticiaService.actualizar(id, noticiaDTO)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id) {

        noticiaService.eliminar(id);

        return ResponseEntity.ok(
                ApiResponse.ok("Noticia eliminada", null));
    }

    // ── Nuevos endpoints públicos (SOS-45) ───────────────────────────────────

    /**
     * Retorna las noticias propias con estado PUBLICADO,
     * ordenadas por fecha de publicación descendente.
     * No requiere autenticación JWT.
     */
    @GetMapping("/publicas")
    public ResponseEntity<ApiResponse<List<NoticiaDTO>>> listarPublicadas() {
        return ResponseEntity.ok(
                ApiResponse.ok(noticiaService.listarPublicadas()));
    }

    /**
     * Retorna noticias de Bolivia desde la API externa newsdata.io.
     * Los resultados se cachean 15 minutos en memoria.
     * No requiere autenticación JWT.
     */
    @GetMapping("/externas")
        public ResponseEntity<ApiResponse<ResultadoNoticiasExternasDTO>> listarExternas() {
        return ResponseEntity.ok(
                ApiResponse.ok(noticiaExternaService.obtenerNoticias()));
    }
}

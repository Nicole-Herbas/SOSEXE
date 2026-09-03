package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.CentroDTO;
import bo.edu.sos.backend.service.CentroService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/centros")
public class CentroController {

    private final CentroService centroService;

    public CentroController(CentroService centroService) {
        this.centroService = centroService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CentroDTO>>> listarTodos() {
        return ResponseEntity.ok(
                ApiResponse.ok(centroService.listarTodos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CentroDTO>> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(centroService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CentroDTO>> crear(
            @Valid @RequestBody CentroDTO centroDTO) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        centroService.guardar(centroDTO)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CentroDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CentroDTO centroDTO) {

        return ResponseEntity.ok(
                ApiResponse.ok("Centro actualizado",
                        centroService.actualizar(id, centroDTO)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id) {

        centroService.eliminar(id);

        return ResponseEntity.ok(
                ApiResponse.ok("Centro eliminado", null));
    }
}
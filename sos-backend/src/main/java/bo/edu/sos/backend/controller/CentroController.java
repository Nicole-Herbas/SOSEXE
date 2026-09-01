package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.CentroDTO;
import bo.edu.sos.backend.service.CentroService;
import jakarta.validation.Valid;
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
    public ResponseEntity<List<CentroDTO>> listarTodos() {
        return ResponseEntity.ok(
                centroService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CentroDTO> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                centroService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CentroDTO> crear(
            @Valid @RequestBody CentroDTO centroDTO) {

        return ResponseEntity.ok(
                centroService.guardar(centroDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CentroDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CentroDTO centroDTO) {

        return ResponseEntity.ok(
                centroService.actualizar(id, centroDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        centroService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}
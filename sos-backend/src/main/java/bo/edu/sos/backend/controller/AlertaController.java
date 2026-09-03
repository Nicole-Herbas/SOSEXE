package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.AlertaDTO;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.service.AlertaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertas")
public class AlertaController {

    private final AlertaService alertaService;

    public AlertaController(AlertaService alertaService) {
        this.alertaService = alertaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertaDTO>>> listarTodas() {
        return ResponseEntity.ok(
                ApiResponse.ok(alertaService.listarTodas()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AlertaDTO>> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(alertaService.buscarPorId(id)));
    }

    @GetMapping("/departamento/{departamentoId}")
    public ResponseEntity<ApiResponse<List<AlertaDTO>>> buscarPorDepartamento(
            @PathVariable Long departamentoId) {

        return ResponseEntity.ok(
                ApiResponse.ok(alertaService
                        .buscarPorDepartamento(departamentoId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AlertaDTO>> crear(
            @Valid @RequestBody AlertaDTO alertaDTO) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        alertaService.guardar(alertaDTO)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AlertaDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody AlertaDTO alertaDTO) {

        return ResponseEntity.ok(
                ApiResponse.ok("Alerta actualizada",
                        alertaService.actualizar(id, alertaDTO)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id) {

        alertaService.eliminar(id);

        return ResponseEntity.ok(
                ApiResponse.ok("Alerta eliminada", null));
    }
}

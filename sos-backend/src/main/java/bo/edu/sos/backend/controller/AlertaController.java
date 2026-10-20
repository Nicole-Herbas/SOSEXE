package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.AlertaDTO;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.CrearAlertaDTO;
import bo.edu.sos.backend.dto.PublicarAlertaDTO;
import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.service.AlertaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.net.URI;

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

    @GetMapping("/borradores")
    public ResponseEntity<ApiResponse<List<AlertaDTO>>> listarBorradores() {
        return ResponseEntity.ok(ApiResponse.ok(alertaService.listarBorradores()));
    }

    @GetMapping("/{id}/revision")
    public ResponseEntity<ApiResponse<AlertaDTO>> revisar(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(alertaService.buscarParaRevision(id)));
    }

    @PostMapping("/{id}/publicar")
    public ResponseEntity<ApiResponse<AlertaDTO>> publicar(
            @PathVariable Long id,
            @Valid @RequestBody PublicarAlertaDTO solicitud,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok("Alerta publicada correctamente",
                alertaService.publicar(id, solicitud, authentication.getName())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AlertaDTO>> buscarPorId(
            @PathVariable Long id, Authentication authentication) {

        boolean administrador = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> Roles.ADMIN.equals(authority.getAuthority()));
        return ResponseEntity.ok(
                ApiResponse.ok(administrador
                        ? alertaService.buscarParaRevision(id) : alertaService.buscarPorId(id)));
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
            @Valid @RequestBody CrearAlertaDTO alertaDTO,
            Authentication authentication) {

        AlertaDTO creada = alertaService.guardar(alertaDTO, authentication.getName());
        return ResponseEntity
                .created(URI.create("/api/alertas/" + creada.getId()))
                .body(ApiResponse.created(creada));
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

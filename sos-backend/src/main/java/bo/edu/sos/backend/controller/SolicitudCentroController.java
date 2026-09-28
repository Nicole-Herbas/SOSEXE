package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.SolicitudCentroDTO;
import bo.edu.sos.backend.service.SolicitudCentroService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes-centro")
public class SolicitudCentroController {

    private final SolicitudCentroService solicitudCentroService;

    public SolicitudCentroController(
            SolicitudCentroService solicitudCentroService) {

        this.solicitudCentroService = solicitudCentroService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SolicitudCentroDTO>>> listarTodas() {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        solicitudCentroService.listarTodas()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SolicitudCentroDTO>> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        solicitudCentroService.buscarPorId(id)
                )
        );
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponse<List<SolicitudCentroDTO>>> listarPorEstado(
            @PathVariable String estado) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        solicitudCentroService.listarPorEstado(estado)
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SolicitudCentroDTO>> crear(
            @Valid @RequestBody SolicitudCentroDTO dto) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.created(
                                solicitudCentroService.crear(dto)
                        )
                );
    }
}
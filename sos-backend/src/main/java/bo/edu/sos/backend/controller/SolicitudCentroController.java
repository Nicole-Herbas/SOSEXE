package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.CambiarEstadoSolicitudDTO;
import bo.edu.sos.backend.dto.SolicitudCentroDTO;
import bo.edu.sos.backend.service.SolicitudCentroService;
import bo.edu.sos.backend.service.SolicitudCentroService.DocumentoSolicitud;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping(ApiRoutes.SOLICITUDES_CENTRO)
public class SolicitudCentroController {

    private final SolicitudCentroService solicitudCentroService;

    public SolicitudCentroController(SolicitudCentroService solicitudCentroService) {
        this.solicitudCentroService = solicitudCentroService;
    }

    // Solo ADMIN (regla en SecurityConfig)
    @GetMapping
    public ResponseEntity<ApiResponse<List<SolicitudCentroDTO>>> listarTodas() {

        return ResponseEntity.ok(
                ApiResponse.ok(solicitudCentroService.listarTodas()));
    }

    // Solo ADMIN
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SolicitudCentroDTO>> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(solicitudCentroService.buscarPorId(id)));
    }

    // Solo ADMIN
    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponse<List<SolicitudCentroDTO>>> listarPorEstado(
            @PathVariable String estado) {

        return ResponseEntity.ok(
                ApiResponse.ok(solicitudCentroService.listarPorEstado(estado)));
    }

    // Usuario autenticado (SOS-41)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<SolicitudCentroDTO>> crear(
            @RequestPart("solicitud") @Valid SolicitudCentroDTO dto,
            @RequestPart("personeria") MultipartFile personeria,
            @RequestPart("nit") MultipartFile nit,
            @RequestPart("identidad") MultipartFile identidad,
            @RequestPart("domicilio") MultipartFile domicilio) {

        SolicitudCentroDTO creada = solicitudCentroService.crear(
                dto, personeria, nit, identidad, domicilio);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(creada));
    }

    // ==========================================
    // SOS-43: solo ADMIN
    // ==========================================

    /**
     * Aprobar, rechazar o solicitar cambios.
     * Body: { "estado": "APROBADA" | "RECHAZADA" | "CAMBIOS_SOLICITADOS", "observacion": "..." }
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<SolicitudCentroDTO>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoSolicitudDTO dto,
            Authentication authentication) {

        // El JwtAuthenticationFilter guarda el email como "name" del usuario logueado
        String emailAdmin = authentication.getName();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        solicitudCentroService.cambiarEstado(id, dto, emailAdmin)));
    }

    /**
     * Ver un documento de la solicitud.
     * tipo: personeria | nit | identidad | domicilio
     */
    @GetMapping("/{id}/documentos/{tipo}")
    public ResponseEntity<Resource> verDocumento(
            @PathVariable Long id,
            @PathVariable String tipo) {

        DocumentoSolicitud documento = solicitudCentroService.obtenerDocumento(id, tipo);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(documento.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + documento.nombre() + "\"")
                .body(documento.recurso());
    }
}

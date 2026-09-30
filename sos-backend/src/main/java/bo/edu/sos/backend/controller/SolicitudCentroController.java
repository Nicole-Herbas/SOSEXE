package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.SolicitudCentroDTO;
import bo.edu.sos.backend.service.SolicitudCentroService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    /**
     * Usuario autenticado.
     * Recibe multipart/form-data con:
     *  - "solicitud": JSON con los datos del formulario
     *  - "personeria", "nit", "identidad", "domicilio": los 4 documentos
     */
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
}

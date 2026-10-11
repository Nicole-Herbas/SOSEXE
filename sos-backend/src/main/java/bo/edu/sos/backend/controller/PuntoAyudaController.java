package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.PuntoAyudaDTO;
import bo.edu.sos.backend.dto.RegistrarPuntoAyudaDTO;
import bo.edu.sos.backend.service.PuntoAyudaService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(ApiRoutes.PUNTOS_AYUDA)
public class PuntoAyudaController {

    private final PuntoAyudaService puntoAyudaService;


    public PuntoAyudaController(PuntoAyudaService puntoAyudaService) {
        this.puntoAyudaService = puntoAyudaService;
    }


    @GetMapping("/mios")
    public ResponseEntity<ApiResponse<List<PuntoAyudaDTO>>> listarMios(
            Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        puntoAyudaService.listarMisPuntos(
                                authentication.getName()
                        )
                )
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<PuntoAyudaDTO>>> listarTodos() {

        return ResponseEntity.ok(
                ApiResponse.ok(puntoAyudaService.listarTodos())
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PuntoAyudaDTO>> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(puntoAyudaService.buscarPorId(id))
        );
    }


    @GetMapping("/departamento/{departamentoId}")
    public ResponseEntity<ApiResponse<List<PuntoAyudaDTO>>> buscarPorDepartamento(
            @PathVariable Long departamentoId) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        puntoAyudaService.buscarPorDepartamento(departamentoId)
                )
        );
    }


    @PostMapping
    public ResponseEntity<ApiResponse<PuntoAyudaDTO>> crear(
            @Valid @RequestBody RegistrarPuntoAyudaDTO dto,
            Authentication authentication) {

        PuntoAyudaDTO creado = puntoAyudaService.registrarComoCiudadano(
                dto,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(creado));
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PuntoAyudaDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PuntoAyudaDTO puntoAyudaDTO) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Punto de ayuda actualizado",
                        puntoAyudaService.actualizar(id, puntoAyudaDTO)
                )
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id) {

        puntoAyudaService.eliminar(id);

        return ResponseEntity.ok(
                ApiResponse.ok("Punto de ayuda eliminado", null)
        );
    }
}

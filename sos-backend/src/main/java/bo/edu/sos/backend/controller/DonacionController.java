package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.DonacionDTO;
import bo.edu.sos.backend.service.DonacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donaciones")
public class DonacionController {

    private final DonacionService donacionService;

    public DonacionController(DonacionService donacionService) {
        this.donacionService = donacionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DonacionDTO>>> listarTodas() {
        return ResponseEntity.ok(
                ApiResponse.ok(donacionService.listarTodas()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DonacionDTO>> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(donacionService.buscarPorId(id)));
    }

    @GetMapping("/centro/{centroId}")
    public ResponseEntity<ApiResponse<List<DonacionDTO>>> buscarPorCentro(
            @PathVariable Long centroId) {

        return ResponseEntity.ok(
                ApiResponse.ok(donacionService.buscarPorCentro(centroId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DonacionDTO>> crear(
            @Valid @RequestBody DonacionDTO donacionDTO) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        donacionService.crear(donacionDTO)));
    }
}

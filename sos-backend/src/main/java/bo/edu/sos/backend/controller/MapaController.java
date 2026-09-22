package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.PuntoMapaDTO;
import bo.edu.sos.backend.service.MapaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mapa")
public class MapaController {

    private final MapaService mapaService;

    public MapaController(MapaService mapaService) {
        this.mapaService = mapaService;
    }

    @GetMapping("/puntos")
    public ResponseEntity<ApiResponse<List<PuntoMapaDTO>>> listarPuntos() {
        return ResponseEntity.ok(
                ApiResponse.ok(mapaService.listarPuntosMapa()));
    }
}

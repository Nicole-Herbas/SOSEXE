package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.PuntoMapaDTO;
import bo.edu.sos.backend.service.MapaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mapa")
public class MapaController {

    private final MapaService mapaService;

    public MapaController(MapaService mapaService) {
        this.mapaService = mapaService;
    }

    @GetMapping("/puntos")
    public ResponseEntity<ApiResponse<List<PuntoMapaDTO>>> listarPuntos(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String necesidad,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) String buscar) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        mapaService.listarPuntosMapa(
                                tipo,
                                necesidad,
                                departamento,
                                buscar
                        )
                )
        );
    }

    @GetMapping("/puntos/{origen}/{id}")
    public ResponseEntity<ApiResponse<PuntoMapaDTO>> buscarDetalle(
            @PathVariable String origen,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        mapaService.buscarDetalle(origen, id)
                )
        );
    }
}

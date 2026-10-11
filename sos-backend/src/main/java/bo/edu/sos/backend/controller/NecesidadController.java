package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.repository.NecesidadRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/necesidades")
public class NecesidadController {

    private final NecesidadRepository necesidadRepository;

    public NecesidadController(NecesidadRepository necesidadRepository) {
        this.necesidadRepository = necesidadRepository;
    }

    public record NecesidadResumen(Long id, String nombre) {}

    @GetMapping
    public ResponseEntity<ApiResponse<List<NecesidadResumen>>> listar() {

        List<NecesidadResumen> necesidades = necesidadRepository
                .findAll(Sort.by("nombre"))
                .stream()
                .map(n -> new NecesidadResumen(n.getId(), n.getNombre()))
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(necesidades));
    }
}
package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.DepartamentoDTO;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import bo.edu.sos.backend.helper.LogHelper;

import java.util.List;

@RestController
@RequestMapping(ApiRoutes.DEPARTAMENTOS)
public class DepartamentoController {

    private final DepartamentoRepository departamentoRepository;

    public DepartamentoController(DepartamentoRepository departamentoRepository) {
        this.departamentoRepository = departamentoRepository;
    }

    // Público: lo usa el formulario de registro de centro
    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartamentoDTO>>> listar() {

        List<DepartamentoDTO> departamentos =
                departamentoRepository
                        .findAll(
                                Sort.by("nombre")
                        )
                        .stream()
                        .map(d ->
                                new DepartamentoDTO(
                                        d.getId(),
                                        d.getNombre()
                                )
                        )
                        .toList();


        LogHelper.debug(
                DepartamentoController.class,
                "Listado de departamentos obtenido. cantidad={}",
                departamentos.size()
        );


        return ResponseEntity.ok(
                ApiResponse.ok(
                        departamentos
                )
        );
    }
}

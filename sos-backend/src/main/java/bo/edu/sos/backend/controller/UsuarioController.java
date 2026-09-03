package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.UsuarioDTO;
import bo.edu.sos.backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UsuarioDTO>>> listarTodos() {
        return ResponseEntity.ok(
                ApiResponse.ok(usuarioService.listarTodos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioDTO>> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.ok(usuarioService.buscarPorId(id)));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UsuarioDTO>> buscarPorEmail(
            @PathVariable String email) {

        return ResponseEntity.ok(
                ApiResponse.ok(usuarioService.buscarPorEmail(email)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioDTO>> crear(
            @Valid @RequestBody UsuarioDTO usuarioDTO) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        usuarioService.guardar(usuarioDTO)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioDTO usuarioDTO) {

        return ResponseEntity.ok(
                ApiResponse.ok("Usuario actualizado",
                        usuarioService.actualizar(id, usuarioDTO)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id) {

        usuarioService.eliminar(id);

        return ResponseEntity.ok(
                ApiResponse.ok("Usuario eliminado", null));
    }
}

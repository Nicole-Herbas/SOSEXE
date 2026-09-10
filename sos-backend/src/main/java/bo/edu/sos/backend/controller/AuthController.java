package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.AuthResponseDTO;
import bo.edu.sos.backend.dto.LoginRequestDTO;
import bo.edu.sos.backend.dto.RegistroRequestDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200") 
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Error: El correo ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword())); 
        usuario.setTelefono(request.getTelefono());
        
        if (request.getRolId() != null) {
            Rol rol = new Rol();
            rol.setId(request.getRolId());
            usuario.setRol(rol);
        }
        
        if (request.getDepartamentoId() != null) {
            Departamento depto = new Departamento();
            depto.setId(request.getDepartamentoId());
            usuario.setDepartamento(depto);
        }

        usuario.setActivo(true);
        usuarioRepository.save(usuario); 
        
        return ResponseEntity.ok("¡Usuario registrado con éxito!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
        
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }
        
        Usuario usuario = usuarioOpt.get();

        if (passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            String tokenSimulado = "jwt-generado-exitosamente-para-" + usuario.getId();
            String rolReal = usuario.getRol().getNombre();
            AuthResponseDTO respuesta = new AuthResponseDTO(
                    tokenSimulado, 
                    usuario.getNombre(), 
                    usuario.getEmail(), 
                    rolReal 
            );
            return ResponseEntity.ok(respuesta);
        } else {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }
    }
}
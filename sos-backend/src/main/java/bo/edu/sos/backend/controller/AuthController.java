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
@CrossOrigin(origins = "http://localhost:4200") // ¡Derribamos el muro de Angular!
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // TAREA SOS-104: REGISTRO DE USUARIO
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        // 1. Validación de correo duplicado
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Error: El correo ya está registrado");
        }

        // 2. Mapear DTO a la Entidad
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword())); // Encriptación lista
        usuario.setTelefono(request.getTelefono());
        
        // Asignar las relaciones (Solo con el ID basta para guardar)
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
        usuarioRepository.save(usuario); // ¡Registro persistido en la BD!
        
        return ResponseEntity.ok("¡Usuario registrado con éxito!");
    }

    // TAREA SOS-99: INICIO DE SESIÓN
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
        
        // 1. Validar que el usuario exista
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }
        
        Usuario usuario = usuarioOpt.get();

        // 2. Validar contraseña encriptada
        if (passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            // Token de rescate para que puedas presentar tu avance a las 5:30
            String tokenSimulado = "jwt-generado-exitosamente-para-" + usuario.getId();
            
            AuthResponseDTO respuesta = new AuthResponseDTO(
                    tokenSimulado, 
                    usuario.getNombre(), 
                    usuario.getEmail(), 
                    "CIUDADANO" // Rol por defecto temporal
            );
            return ResponseEntity.ok(respuesta);
        } else {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }
    }
}
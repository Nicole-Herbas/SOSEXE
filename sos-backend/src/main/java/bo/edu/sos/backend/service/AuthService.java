package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.AuthResponseDTO;
import bo.edu.sos.backend.dto.LoginRequestDTO;
import bo.edu.sos.backend.dto.RegistroRequestDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final DepartamentoRepository departamentoRepository;
    private final PasswordEncoder passwordEncoder;


    public AuthService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            DepartamentoRepository departamentoRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.departamentoRepository = departamentoRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @Transactional
    public void registrar(RegistroRequestDTO request) {

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "El correo ya está registrado"
            );
        }


        Usuario usuario = new Usuario();

        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());

        usuario.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        usuario.setTelefono(request.getTelefono());


        Rol rolUsuario = rolRepository.findByNombre("USER")
                .orElseThrow(() ->
                        new IllegalStateException(
                                "El rol USER no existe en la base de datos"
                        )
                );

        usuario.setRol(rolUsuario);


        if (request.getDepartamentoId() != null) {

            Departamento departamento =
                    departamentoRepository
                            .findById(request.getDepartamentoId())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Departamento",
                                            request.getDepartamentoId()
                                    )
                            );

            usuario.setDepartamento(departamento);
        }


        usuario.setActivo(true);

        usuarioRepository.save(usuario);
    }


    @Transactional(readOnly = true)
    public Optional<AuthResponseDTO> login(
            LoginRequestDTO request) {

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findByEmail(
                        request.getEmail()
                );


        if (usuarioOpt.isEmpty()) {
            return Optional.empty();
        }


        Usuario usuario = usuarioOpt.get();


        boolean passwordCorrecto =
                passwordEncoder.matches(
                        request.getPassword(),
                        usuario.getPassword()
                );


        if (!passwordCorrecto) {
            return Optional.empty();
        }


        String tokenSimulado =
                "jwt-generado-exitosamente-para-"
                        + usuario.getId();


        AuthResponseDTO respuesta =
                new AuthResponseDTO(
                        tokenSimulado,
                        usuario.getNombre(),
                        usuario.getEmail(),
                        usuario.getRol().getNombre()
                );


        return Optional.of(respuesta);
    }
}
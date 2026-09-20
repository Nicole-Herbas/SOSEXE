package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.AuthResponseDTO;
import bo.edu.sos.backend.dto.LoginRequestDTO;
import bo.edu.sos.backend.dto.LoginResultDTO;
import bo.edu.sos.backend.dto.RegistroRequestDTO;
import bo.edu.sos.backend.dto.UsuarioAutenticadoDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.security.JwtService;
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
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;


    public AuthService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            DepartamentoRepository departamentoRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService) {

        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.departamentoRepository = departamentoRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
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
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        usuario.setTelefono(
                request.getTelefono()
        );


        Rol rolUsuario =
                rolRepository.findByNombre("USER")
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "El rol USER no existe en la base de datos"
                                )
                        );

        usuario.setRol(rolUsuario);


        if (request.getDepartamentoId() != null) {

            Departamento departamento =
                    departamentoRepository
                            .findById(
                                    request.getDepartamentoId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Departamento",
                                            request.getDepartamentoId()
                                    )
                            );

            usuario.setDepartamento(
                    departamento
            );
        }


        usuario.setActivo(true);

        usuarioRepository.save(
                usuario
        );
    }


    @Transactional
    public Optional<LoginResultDTO> login(
            LoginRequestDTO request) {

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findByEmail(
                        request.getEmail()
                );


        if (usuarioOpt.isEmpty()) {
            return Optional.empty();
        }


        Usuario usuario =
                usuarioOpt.get();


        boolean passwordCorrecto =
                passwordEncoder.matches(
                        request.getPassword(),
                        usuario.getPassword()
                );


        if (!passwordCorrecto) {
            return Optional.empty();
        }


        String accessToken =
                jwtService.generarToken(
                        usuario
                );


        String refreshToken =
                refreshTokenService.crear(
                        usuario
                );


        AuthResponseDTO respuesta =
                new AuthResponseDTO(
                        accessToken,
                        usuario.getNombre(),
                        usuario.getEmail(),
                        usuario.getRol().getNombre()
                );


        LoginResultDTO resultado =
                new LoginResultDTO(
                        respuesta,
                        refreshToken
                );


        return Optional.of(
                resultado
        );
    }


    @Transactional(readOnly = true)
    public UsuarioAutenticadoDTO obtenerUsuarioAutenticado(
            String email) {

        Usuario usuario =
                usuarioRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + email
                                )
                        );


        return new UsuarioAutenticadoDTO(
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().getNombre()
        );
    }

    @Transactional
    public Optional<LoginResultDTO> refrescar(
            String refreshToken) {

        Optional<Usuario> usuarioOpt =
                refreshTokenService.validar(
                        refreshToken
                );


        if (usuarioOpt.isEmpty()) {
            return Optional.empty();
        }


        Usuario usuario =
                usuarioOpt.get();


        if (!Boolean.TRUE.equals(
                usuario.getActivo()
        )) {

            refreshTokenService.revocar(
                    refreshToken
            );

            return Optional.empty();
        }


        String nuevoAccessToken =
                jwtService.generarToken(
                        usuario
                );


        String nuevoRefreshToken =
                refreshTokenService.crear(
                        usuario
                );


        AuthResponseDTO respuesta =
                new AuthResponseDTO(
                        nuevoAccessToken,
                        usuario.getNombre(),
                        usuario.getEmail(),
                        usuario.getRol().getNombre()
                );


        LoginResultDTO resultado =
                new LoginResultDTO(
                        respuesta,
                        nuevoRefreshToken
                );


        return Optional.of(
                resultado
        );
    }
}
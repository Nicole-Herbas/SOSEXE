package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.Roles;
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
import bo.edu.sos.backend.helper.LogHelper;
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
    public void registrar(
            RegistroRequestDTO request) {

        if (usuarioRepository.existsByEmail(
                request.getEmail()
        )) {

            throw new DuplicateResourceException(
                    "El correo ya está registrado"
            );
        }


        Usuario usuario =
                new Usuario();


        usuario.setNombre(
                request.getNombre()
        );

        usuario.setEmail(
                request.getEmail()
        );


        usuario.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        usuario.setTelefono(
                request.getTelefono()
        );


        Rol rolUsuario =
                rolRepository
                        .findByNombre(
                                Roles.USER
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "El rol USER no existe en la base de datos"
                                )
                        );


        usuario.setRol(
                rolUsuario
        );


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


        usuario.setActivo(
                true
        );


        usuarioRepository.save(
                usuario
        );


        LogHelper.info(
                AuthService.class,
                "Registro de usuario completado correctamente"
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

            LogHelper.warn(
                    AuthService.class,
                    "Intento de inicio de sesión rechazado"
            );

            return Optional.empty();
        }


        Usuario usuario =
                usuarioOpt.get();


        if (!Boolean.TRUE.equals(
                usuario.getActivo()
        )) {

            LogHelper.warn(
                    AuthService.class,
                    "Inicio de sesión rechazado por usuario inactivo"
            );

            return Optional.empty();
        }


        boolean passwordCorrecto =
                passwordEncoder.matches(
                        request.getPassword(),
                        usuario.getPassword()
                );


        if (!passwordCorrecto) {

            LogHelper.warn(
                    AuthService.class,
                    "Intento de inicio de sesión con credenciales inválidas"
            );

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


        LogHelper.info(
                AuthService.class,
                "Inicio de sesión completado correctamente"
        );


        return Optional.of(
                resultado
        );
    }


    @Transactional(readOnly = true)
    public UsuarioAutenticadoDTO obtenerUsuarioAutenticado(
            String email) {

        Usuario usuario =
                usuarioRepository
                        .findByEmail(
                                email
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + email
                                )
                        );


        LogHelper.debug(
                AuthService.class,
                "Consulta de usuario autenticado completada"
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

            LogHelper.warn(
                    AuthService.class,
                    "Intento de renovación con refresh token inválido"
            );

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


            LogHelper.warn(
                    AuthService.class,
                    "Renovación de sesión rechazada por usuario inactivo"
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


        LogHelper.info(
                AuthService.class,
                "Token de acceso renovado correctamente"
        );


        return Optional.of(
                resultado
        );
    }


    @Transactional
    public void logout(
            String refreshToken) {

        if (
                refreshToken != null
                        &&
                        !refreshToken.isBlank()
        ) {

            refreshTokenService.revocar(
                    refreshToken
            );


            LogHelper.info(
                    AuthService.class,
                    "Sesión cerrada correctamente"
            );
        }
    }
}
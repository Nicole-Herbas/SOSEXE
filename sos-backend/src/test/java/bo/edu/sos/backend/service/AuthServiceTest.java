package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.LoginRequestDTO;
import bo.edu.sos.backend.dto.LoginResultDTO;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.security.JwtService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private DepartamentoRepository departamentoRepository;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder
            passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;


    private AuthService authService;


    @BeforeEach
    void setUp() {

        authService =
                new AuthService(
                        usuarioRepository,
                        rolRepository,
                        departamentoRepository,
                        passwordEncoder,
                        jwtService,
                        refreshTokenService
                );
    }


    @Test
    void loginCorrectoDebeGenerarAccessYRefreshToken() {

        LoginRequestDTO request =
                new LoginRequestDTO();

        request.setEmail(
                "admin@sos.com"
        );

        request.setPassword(
                "123456"
        );


        Rol rol = new Rol();
        rol.setNombre("ADMIN");


        Usuario usuario =
                new Usuario();

        usuario.setId(1L);
        usuario.setNombre(
                "Administrador"
        );

        usuario.setEmail(
                "admin@sos.com"
        );

        usuario.setPassword(
                "password-hasheado"
        );

        usuario.setRol(rol);
        usuario.setActivo(true);


        when(
                usuarioRepository.findByEmail(
                        "admin@sos.com"
                )
        ).thenReturn(
                Optional.of(usuario)
        );


        when(
                passwordEncoder.matches(
                        "123456",
                        "password-hasheado"
                )
        ).thenReturn(true);


        when(
                jwtService.generarToken(
                        usuario
                )
        ).thenReturn(
                "access-token-prueba"
        );


        when(
                refreshTokenService.crear(
                        usuario
                )
        ).thenReturn(
                "refresh-token-prueba"
        );


        Optional<LoginResultDTO> resultado =
                authService.login(request);


        assertTrue(
                resultado.isPresent()
        );


        assertEquals(
                "access-token-prueba",
                resultado
                        .get()
                        .getRespuesta()
                        .getToken()
        );


        assertEquals(
                "refresh-token-prueba",
                resultado
                        .get()
                        .getRefreshToken()
        );


        assertEquals(
                "ADMIN",
                resultado
                        .get()
                        .getRespuesta()
                        .getRol()
        );


        verify(
                jwtService
        ).generarToken(usuario);


        verify(
                refreshTokenService
        ).crear(usuario);
    }


    @Test
    void passwordIncorrectoNoDebeGenerarTokens() {

        LoginRequestDTO request =
                new LoginRequestDTO();

        request.setEmail(
                "usuario@sos.com"
        );

        request.setPassword(
                "incorrecta"
        );


        Usuario usuario =
                new Usuario();

        usuario.setEmail(
                "usuario@sos.com"
        );

        usuario.setPassword(
                "password-hasheado"
        );


        when(
                usuarioRepository.findByEmail(
                        "usuario@sos.com"
                )
        ).thenReturn(
                Optional.of(usuario)
        );


        when(
                passwordEncoder.matches(
                        "incorrecta",
                        "password-hasheado"
                )
        ).thenReturn(false);


        Optional<LoginResultDTO> resultado =
                authService.login(request);


        assertTrue(
                resultado.isEmpty()
        );


        verify(
                jwtService,
                never()
        ).generarToken(
                any()
        );


        verify(
                refreshTokenService,
                never()
        ).crear(
                any()
        );
    }


    @Test
    void usuarioInexistenteNoDebeIniciarSesion() {

        LoginRequestDTO request =
                new LoginRequestDTO();

        request.setEmail(
                "noexiste@sos.com"
        );

        request.setPassword(
                "123456"
        );


        when(
                usuarioRepository.findByEmail(
                        "noexiste@sos.com"
                )
        ).thenReturn(
                Optional.empty()
        );


        Optional<LoginResultDTO> resultado =
                authService.login(request);


        assertTrue(
                resultado.isEmpty()
        );


        verify(
                passwordEncoder,
                never()
        ).matches(
                anyString(),
                anyString()
        );


        verify(
                jwtService,
                never()
        ).generarToken(
                any()
        );
    }


    @Test
    void refreshValidoDebeGenerarTokensNuevos() {

        Usuario usuario =
                new Usuario();

        Rol rol =
                new Rol();

        rol.setNombre("USER");

        usuario.setId(2L);
        usuario.setNombre(
                "Usuario prueba"
        );

        usuario.setEmail(
                "usuario@sos.com"
        );

        usuario.setRol(rol);
        usuario.setActivo(true);


        when(
                refreshTokenService.validar(
                        "refresh-viejo"
                )
        ).thenReturn(
                Optional.of(usuario)
        );


        when(
                jwtService.generarToken(
                        usuario
                )
        ).thenReturn(
                "access-nuevo"
        );


        when(
                refreshTokenService.crear(
                        usuario
                )
        ).thenReturn(
                "refresh-nuevo"
        );


        Optional<LoginResultDTO> resultado =
                authService.refrescar(
                        "refresh-viejo"
                );


        assertTrue(
                resultado.isPresent()
        );


        assertEquals(
                "access-nuevo",
                resultado
                        .get()
                        .getRespuesta()
                        .getToken()
        );


        assertEquals(
                "refresh-nuevo",
                resultado
                        .get()
                        .getRefreshToken()
        );
    }


    @Test
    void refreshInvalidoNoDebeGenerarAccessToken() {

        when(
                refreshTokenService.validar(
                        "refresh-falso"
                )
        ).thenReturn(
                Optional.empty()
        );


        Optional<LoginResultDTO> resultado =
                authService.refrescar(
                        "refresh-falso"
                );


        assertTrue(
                resultado.isEmpty()
        );


        verify(
                jwtService,
                never()
        ).generarToken(
                any()
        );
    }


    @Test
    void logoutDebeRevocarRefreshToken() {

        authService.logout(
                "refresh-token-prueba"
        );


        verify(
                refreshTokenService
        ).revocar(
                "refresh-token-prueba"
        );
    }

    @Test
    void usuarioInactivoNoDebeIniciarSesion() {

        LoginRequestDTO request =
                new LoginRequestDTO();

        request.setEmail(
                "inactivo@sos.com"
        );

        request.setPassword(
                "123456"
        );


        Usuario usuario =
                new Usuario();

        usuario.setEmail(
                "inactivo@sos.com"
        );

        usuario.setPassword(
                "password-hasheado"
        );

        usuario.setActivo(false);


        when(
                usuarioRepository.findByEmail(
                        "inactivo@sos.com"
                )
        ).thenReturn(
                Optional.of(usuario)
        );


        Optional<LoginResultDTO> resultado =
                authService.login(request);


        assertTrue(
                resultado.isEmpty()
        );


        verify(
                passwordEncoder,
                never()
        ).matches(
                anyString(),
                anyString()
        );


        verify(
                jwtService,
                never()
        ).generarToken(
                any()
        );


        verify(
                refreshTokenService,
                never()
        ).crear(
                any()
        );
    }
}
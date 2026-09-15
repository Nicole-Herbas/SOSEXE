package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.AuthConstants;
import bo.edu.sos.backend.dto.AuthResponseDTO;
import bo.edu.sos.backend.dto.LoginRequestDTO;
import bo.edu.sos.backend.dto.RegistroRequestDTO;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
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
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private RegistroRequestDTO registroRequest;
    private LoginRequestDTO loginRequest;
    private Usuario usuarioMock;
    private Rol rolMock;

    @BeforeEach
    void setUp() {
        rolMock = new Rol();
        rolMock.setId(1L);
        rolMock.setNombre("ADMIN");

        usuarioMock = new Usuario();
        usuarioMock.setId(1L);
        usuarioMock.setNombre("Test User");
        usuarioMock.setEmail("test@test.com");
        usuarioMock.setPassword("$2a$hashed");
        usuarioMock.setRol(rolMock);

        registroRequest = new RegistroRequestDTO();
        registroRequest.setNombre("Test User");
        registroRequest.setEmail("test@test.com");
        registroRequest.setPassword("password123");
        registroRequest.setRolId(1L);

        loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("password123");
    }

    // ── Tests de registro ──────────────────────────────────────────────────

    @Test
    void registrar_deberiaLanzarExcepcion_siEmailYaExiste() {
        when(usuarioRepository.existsByEmail("test@test.com")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> authService.registrar(registroRequest)
        );

        assertEquals(AuthConstants.EMAIL_YA_REGISTRADO, ex.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void registrar_deberiaGuardarUsuario_siEmailNuevo() {
        when(usuarioRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rolMock));
        when(passwordEncoder.encode("password123")).thenReturn("$2a$hashed");

        assertDoesNotThrow(() -> authService.registrar(registroRequest));

        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void registrar_deberiaCodificarPassword_antesDeGuardar() {
        when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
        when(rolRepository.findById(anyLong())).thenReturn(Optional.of(rolMock));
        when(passwordEncoder.encode("password123")).thenReturn("$2a$encoded");

        authService.registrar(registroRequest);

        verify(passwordEncoder, times(1)).encode("password123");
    }

    // ── Tests de login ─────────────────────────────────────────────────────

    @Test
    void login_deberiaLanzarExcepcion_siUsuarioNoExiste() {
        when(usuarioRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> authService.login(loginRequest)
        );

        assertEquals(AuthConstants.CREDENCIALES_INCORRECTAS, ex.getMessage());
    }

    @Test
    void login_deberiaLanzarExcepcion_siPasswordIncorrecta() {
        when(usuarioRepository.findByEmail("test@test.com")).thenReturn(Optional.of(usuarioMock));
        when(passwordEncoder.matches("password123", "$2a$hashed")).thenReturn(false);

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> authService.login(loginRequest)
        );

        assertEquals(AuthConstants.CREDENCIALES_INCORRECTAS, ex.getMessage());
    }

    @Test
    void login_deberiaRetornarAuthResponse_siCredencialesCorrectas() {
        when(usuarioRepository.findByEmail("test@test.com")).thenReturn(Optional.of(usuarioMock));
        when(passwordEncoder.matches("password123", "$2a$hashed")).thenReturn(true);

        AuthResponseDTO respuesta = authService.login(loginRequest);

        assertNotNull(respuesta);
        assertEquals("test@test.com", respuesta.getEmail());
        assertEquals("Test User", respuesta.getNombre());
        assertEquals("ADMIN", respuesta.getRol());
        assertTrue(respuesta.getToken().startsWith(AuthConstants.TOKEN_PREFIX));
    }

    @Test
    void login_tokenDebeContenerIdDelUsuario() {
        when(usuarioRepository.findByEmail("test@test.com")).thenReturn(Optional.of(usuarioMock));
        when(passwordEncoder.matches("password123", "$2a$hashed")).thenReturn(true);

        AuthResponseDTO respuesta = authService.login(loginRequest);

        assertTrue(respuesta.getToken().contains("1")); // id del usuario mock = 1
    }
}

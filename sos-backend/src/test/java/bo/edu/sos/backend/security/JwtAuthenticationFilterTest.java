package bo.edu.sos.backend.security;

import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UsuarioRepository usuarioRepository;

    private JwtAuthenticationFilter filtro;


    @BeforeEach
    void inicializar() {
        SecurityContextHolder.clearContext();
        filtro = new JwtAuthenticationFilter(jwtService, usuarioRepository);
    }


    @AfterEach
    void limpiar() {
        SecurityContextHolder.clearContext();
    }


    @Test
    void jwtValidoDebeAutenticarConEmailYRolDelUsuario() throws Exception {

        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setEmail("usuario@ejemplo.com");
        usuario.setActivo(true);

        Rol rol = new Rol();
        rol.setNombre(Roles.USER);
        usuario.setRol(rol);

        when(jwtService.esValido("token-valido"))
                .thenReturn(true);
        when(jwtService.extraerEmail("token-valido"))
                .thenReturn("usuario@ejemplo.com");
        when(usuarioRepository.findByEmail("usuario@ejemplo.com"))
                .thenReturn(Optional.of(usuario));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-valido");

        filtro.doFilter(
                request,
                new MockHttpServletResponse(),
                new MockFilterChain()
        );

        var autenticacion = SecurityContextHolder.getContext().getAuthentication();

        assertNotNull(autenticacion);
        assertEquals("usuario@ejemplo.com", autenticacion.getName());
        assertTrue(autenticacion.getAuthorities().stream().anyMatch(
                autoridad -> Roles.USER.equals(autoridad.getAuthority())
        ));
    }


    @Test
    void jwtInvalidoNoDebeAutenticar() throws Exception {

        when(jwtService.esValido("token-invalido"))
                .thenReturn(false);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-invalido");

        filtro.doFilter(
                request,
                new MockHttpServletResponse(),
                new MockFilterChain()
        );

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(usuarioRepository);
    }


    @Test
    void usuarioInactivoNoDebeAutenticar() throws Exception {

        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setActivo(false);

        when(jwtService.esValido("token-valido"))
                .thenReturn(true);
        when(jwtService.extraerEmail("token-valido"))
                .thenReturn("usuario@ejemplo.com");
        when(usuarioRepository.findByEmail("usuario@ejemplo.com"))
                .thenReturn(Optional.of(usuario));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-valido");

        filtro.doFilter(
                request,
                new MockHttpServletResponse(),
                new MockFilterChain()
        );

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}

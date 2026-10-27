package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ForbiddenException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private DepartamentoRepository departamentoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    // ── Cambio de estado ──────────────────────────────────────────

    @Test
    void cambiarEstado_rechazaActivoNulo() {

        assertThrows(BadRequestException.class,
                () -> usuarioService.cambiarEstado(1L, null));

        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void cambiarEstado_rechazaUsuarioInexistente() {

        when(usuarioRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> usuarioService.cambiarEstado(99L, true));

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void cambiarEstado_desactivaUsuarioNormal() {

        Rol rolUser = new Rol();
        rolUser.setId(2L);
        rolUser.setNombre(Roles.USER);

        Usuario usuario = new Usuario();
        usuario.setId(5L);
        usuario.setActivo(true);
        usuario.setRol(rolUser);

        when(usuarioRepository.findById(5L))
                .thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario))
                .thenReturn(usuario);

        usuarioService.cambiarEstado(5L, false);

        assertEquals(false, usuario.getActivo());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void cambiarEstado_impideDesactivarUltimoAdmin() {

        Rol rolAdmin = new Rol();
        rolAdmin.setId(1L);
        rolAdmin.setNombre(Roles.ADMIN);

        Usuario admin = new Usuario();
        admin.setId(1L);
        admin.setActivo(true);
        admin.setRol(rolAdmin);

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(admin));
        when(usuarioRepository.countByRolIdAndActivo(1L, true))
                .thenReturn(1L);

        assertThrows(ForbiddenException.class,
                () -> usuarioService.cambiarEstado(1L, false));

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void cambiarEstado_permiteDesactivarAdmin_siHayOtroActivo() {

        Rol rolAdmin = new Rol();
        rolAdmin.setId(1L);
        rolAdmin.setNombre(Roles.ADMIN);

        Usuario admin = new Usuario();
        admin.setId(1L);
        admin.setActivo(true);
        admin.setRol(rolAdmin);

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(admin));
        when(usuarioRepository.countByRolIdAndActivo(1L, true))
                .thenReturn(2L);
        when(usuarioRepository.save(admin))
                .thenReturn(admin);

        usuarioService.cambiarEstado(1L, false);

        assertEquals(false, admin.getActivo());
        verify(usuarioRepository).save(admin);
    }
}
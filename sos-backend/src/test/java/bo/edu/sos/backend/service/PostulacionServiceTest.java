package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoPostulacion;
import bo.edu.sos.backend.dto.PostulacionDTO;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.repository.PostulacionRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostulacionServiceTest {

    @Mock
    private PostulacionRepository postulacionRepository;

    @Mock
    private VoluntariadoRepository voluntariadoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private PostulacionService postulacionService;

    @Test
    void crear_lanzaDuplicado_siElUsuarioYaSePostulo() {

        Usuario usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(10L);

        when(usuarioRepository.findByEmail("lucia@sos.org"))
                .thenReturn(Optional.of(usuario));
        when(postulacionRepository
                .existsByVoluntariadoIdAndUsuarioId(1L, 10L))
                .thenReturn(true);

        PostulacionDTO dto = new PostulacionDTO();
        dto.setVoluntariadoId(1L);

        assertThrows(DuplicateResourceException.class,
                () -> postulacionService.crear(dto, "lucia@sos.org"));

        verify(postulacionRepository, never()).save(any());
    }

    @Test
    void actualizarEstado_rechazaEstadoInvalido_sinTocarLaBaseDeDatos() {

        assertThrows(BadRequestException.class,
                () -> postulacionService.actualizarEstado(
                        1L, "INVENTADO", "admin@sos.org"));

        verifyNoInteractions(postulacionRepository, usuarioRepository);
    }

    @Test
    void esValido_aceptaLosTresEstadosDefinidos() {

        assertTrue(EstadoPostulacion.esValido(EstadoPostulacion.PENDIENTE));
        assertTrue(EstadoPostulacion.esValido(EstadoPostulacion.APROBADO));
        assertTrue(EstadoPostulacion.esValido(EstadoPostulacion.RECHAZADO));
    }

    @Test
    void esValido_rechazaValoresFueraDeLaLista() {

        assertFalse(EstadoPostulacion.esValido("ACEPTADA"));
        assertFalse(EstadoPostulacion.esValido(""));
        assertFalse(EstadoPostulacion.esValido(null));
    }
}
package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.SuscripcionSmsDTO;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.SuscripcionSmsRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SuscripcionSmsServiceTest {

    @Mock
    private SuscripcionSmsRepository suscripcionSmsRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private DepartamentoRepository departamentoRepository;

    @InjectMocks
    private SuscripcionSmsService suscripcionSmsService;

    @Test
    void suscribir_rechazaTelefonoVacio_sinTocarLaBaseDeDatos() {

        SuscripcionSmsDTO dto = new SuscripcionSmsDTO();
        dto.setTelefono("");
        dto.setDepartamentoId(3L);

        assertThrows(BadRequestException.class,
                () -> suscripcionSmsService.suscribir(dto, "user@sos.org"));

        verifyNoInteractions(suscripcionSmsRepository, usuarioRepository, departamentoRepository);
    }

    @Test
    void suscribir_rechazaUsuarioInexistente() {

        SuscripcionSmsDTO dto = new SuscripcionSmsDTO();
        dto.setTelefono("71234567");
        dto.setDepartamentoId(3L);

        when(usuarioRepository.findByEmail("noexiste@sos.org"))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> suscripcionSmsService.suscribir(dto, "noexiste@sos.org"));

        verifyNoInteractions(suscripcionSmsRepository);
    }

    @Test
    void obtenerMia_rechazaSiNoExisteSuscripcion() {

        Usuario usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(10L);

        when(usuarioRepository.findByEmail("user@sos.org"))
                .thenReturn(Optional.of(usuario));
        when(suscripcionSmsRepository.findByUsuarioId(10L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> suscripcionSmsService.obtenerMia("user@sos.org"));
    }
}
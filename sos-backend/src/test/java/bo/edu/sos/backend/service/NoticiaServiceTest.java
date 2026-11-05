package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.NoticiaConstants;
import bo.edu.sos.backend.entity.Noticia;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.repository.NoticiaRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoticiaServiceTest {

    @Mock
    private NoticiaRepository noticiaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private NoticiaService noticiaService;

    @Test
    void actualizar_rechazaNoticiaPublicada() {
        Noticia noticia = new Noticia();
        noticia.setId(1L);
        noticia.setEstado(NoticiaConstants.ESTADO_PUBLICADO);

        when(noticiaRepository.findById(1L)).thenReturn(Optional.of(noticia));

        bo.edu.sos.backend.dto.NoticiaDTO dto = new bo.edu.sos.backend.dto.NoticiaDTO();
        
        assertThrows(BadRequestException.class, () -> noticiaService.actualizar(1L, dto));
    }
}
package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.NoticiaDTO;
import bo.edu.sos.backend.dto.NoticiaExternaDTO;
import bo.edu.sos.backend.service.NoticiaExternaService;
import bo.edu.sos.backend.service.NoticiaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoticiaControllerTest {

    @Mock
    private NoticiaService noticiaService;

    @Mock
    private NoticiaExternaService noticiaExternaService;

    private NoticiaController noticiaController;

    @BeforeEach
    void setUp() {
        noticiaController = new NoticiaController(noticiaService, noticiaExternaService);
    }

    @Test
    void listarPublicadasDebeRetornarDatosEnvoltorioApiResponse() {
        NoticiaDTO noticia = new NoticiaDTO();
        noticia.setId(7L);
        noticia.setTitulo("Aviso publicado");
        noticia.setEsExterna(false);
        when(noticiaService.listarPublicadas()).thenReturn(List.of(noticia));

        ResponseEntity<ApiResponse<List<NoticiaDTO>>> respuesta =
                noticiaController.listarPublicadas();

        assertEquals(200, respuesta.getStatusCode().value());
        assertNotNull(respuesta.getBody());
        assertTrue(respuesta.getBody().isSuccess());
        assertEquals("Aviso publicado", respuesta.getBody().getData().get(0).getTitulo());
        assertFalse(respuesta.getBody().getData().get(0).isEsExterna());
        verify(noticiaService).listarPublicadas();
    }

    @Test
    void listarExternasDebeRetornarDatosEnvoltorioApiResponse() {
        NoticiaExternaDTO noticia = new NoticiaExternaDTO();
        noticia.setId("externa-1");
        noticia.setTitulo("Artículo de Bolivia");
        noticia.setUrl("https://example.com/articulo");
        when(noticiaExternaService.obtenerNoticias()).thenReturn(List.of(noticia));

        ResponseEntity<ApiResponse<List<NoticiaExternaDTO>>> respuesta =
                noticiaController.listarExternas();

        assertEquals(200, respuesta.getStatusCode().value());
        assertNotNull(respuesta.getBody());
        assertTrue(respuesta.getBody().isSuccess());
        assertEquals("externa-1", respuesta.getBody().getData().get(0).getId());
        assertEquals("https://example.com/articulo", respuesta.getBody().getData().get(0).getUrl());
        assertTrue(respuesta.getBody().getData().get(0).isEsExterna());
        verify(noticiaExternaService).obtenerNoticias();
    }
}
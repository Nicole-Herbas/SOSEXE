package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.NoticiaConstants;
import bo.edu.sos.backend.dto.NoticiaDTO;
import bo.edu.sos.backend.entity.Noticia;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.NoticiaRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
@DisplayName("NoticiaService — pruebas unitarias SOS-45")
class NoticiaServiceTest {

    @Mock
    private NoticiaRepository noticiaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private NoticiaService noticiaService;


    @BeforeEach
    void setUp() {
        noticiaService = new NoticiaService(noticiaRepository, usuarioRepository);
    }


    // ── Helpers ──────────────────────────────────────────────────────────────

    private Noticia crearNoticiaConEstado(Long id, String titulo,
                                          String categoria, String estado) {
        Usuario autor = new Usuario();
        autor.setId(1L);
        autor.setNombre("Admin SOS");

        Noticia noticia = new Noticia();
        noticia.setId(id);
        noticia.setTitulo(titulo);
        noticia.setContenido("Contenido de prueba para " + titulo);
        noticia.setCategoria(categoria);
        noticia.setEstado(estado);
        noticia.setFechaPublicacion(LocalDateTime.now());
        noticia.setAutor(autor);
        return noticia;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Test 1: listarPublicadas solo retorna estado PUBLICADO
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("listarPublicadas debe retornar unicamente noticias con estado PUBLICADO")
    void listarPublicadasSoloDevuelveEstadoPublicado() {

        Noticia publicada = crearNoticiaConEstado(
                1L, "Incendio en la Chiquitania", NoticiaConstants.CAT_INCENDIOS,
                NoticiaConstants.ESTADO_PUBLICADO);

        when(noticiaRepository.findByEstadoOrderByFechaPublicacionDesc(
                NoticiaConstants.ESTADO_PUBLICADO))
                .thenReturn(List.of(publicada));


        List<NoticiaDTO> resultado = noticiaService.listarPublicadas();


        assertEquals(1, resultado.size());
        assertEquals("Incendio en la Chiquitania", resultado.get(0).getTitulo());
        assertEquals(NoticiaConstants.ESTADO_PUBLICADO, resultado.get(0).getEstado());

        verify(noticiaRepository)
                .findByEstadoOrderByFechaPublicacionDesc(NoticiaConstants.ESTADO_PUBLICADO);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Test 2: listarPublicadas retorna lista vacía si no hay publicadas
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("listarPublicadas debe retornar lista vacia si no hay noticias publicadas")
    void listarPublicadasRetornaListaVaciaSiNoHayPublicadas() {

        when(noticiaRepository.findByEstadoOrderByFechaPublicacionDesc(
                NoticiaConstants.ESTADO_PUBLICADO))
                .thenReturn(List.of());


        List<NoticiaDTO> resultado = noticiaService.listarPublicadas();


        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Test 3: listarPublicadasPorCategoria filtra por categoría y estado
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("listarPublicadasPorCategoria debe filtrar por categoria y estado PUBLICADO")
    void listarPublicadasPorCategoriaFiltraCorrectamente() {

        Noticia noticiaComunidad = crearNoticiaConEstado(
                2L, "Vecinos organizan campaña de acopio",
                NoticiaConstants.CAT_COMUNIDAD, NoticiaConstants.ESTADO_PUBLICADO);

        when(noticiaRepository.findByCategoriaAndEstadoOrderByFechaPublicacionDesc(
                NoticiaConstants.CAT_COMUNIDAD, NoticiaConstants.ESTADO_PUBLICADO))
                .thenReturn(List.of(noticiaComunidad));


        List<NoticiaDTO> resultado = noticiaService
                .listarPublicadasPorCategoria(NoticiaConstants.CAT_COMUNIDAD);


        assertEquals(1, resultado.size());
        assertEquals(NoticiaConstants.CAT_COMUNIDAD, resultado.get(0).getCategoria());
        assertEquals("Vecinos organizan campaña de acopio", resultado.get(0).getTitulo());

        verify(noticiaRepository)
                .findByCategoriaAndEstadoOrderByFechaPublicacionDesc(
                        NoticiaConstants.CAT_COMUNIDAD, NoticiaConstants.ESTADO_PUBLICADO);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Test 4: buscarPorId mapea correctamente todos los campos del DTO
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("buscarPorId debe mapear correctamente titulo, categoria, imagenUrl y autorNombre")
    void buscarPorIdDevuelveDTOConCamposCorrectos() {

        Noticia noticia = crearNoticiaConEstado(
                5L, "Alerta por crecida del río Rocha",
                NoticiaConstants.CAT_INUNDACIONES, NoticiaConstants.ESTADO_PUBLICADO);
        noticia.setImagenUrl("https://ejemplo.com/foto.jpg");
        noticia.setFuente("Defensa Civil Bolivia");

        when(noticiaRepository.findById(5L))
                .thenReturn(Optional.of(noticia));


        NoticiaDTO dto = noticiaService.buscarPorId(5L);


        assertEquals(5L,                                 dto.getId());
        assertEquals("Alerta por crecida del río Rocha", dto.getTitulo());
        assertEquals(NoticiaConstants.CAT_INUNDACIONES,  dto.getCategoria());
        assertEquals("https://ejemplo.com/foto.jpg",     dto.getImagenUrl());
        assertEquals("Admin SOS",                        dto.getAutorNombre());
        assertFalse(dto.isEsExterna(), "Las noticias propias deben tener esExterna=false");
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Test 5: guardar establece estado BORRADOR por defecto
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("guardar debe establecer estado BORRADOR independientemente del DTO enviado")
    void guardarEstableceEstadoBorradorPorDefecto() {

        Usuario autor = new Usuario();
        autor.setId(1L);
        autor.setNombre("Admin SOS");

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(autor));

        // Simular el save devolviendo la entidad con estado BORRADOR
        when(noticiaRepository.save(any(Noticia.class)))
                .thenAnswer(invocation -> {
                    Noticia n = invocation.getArgument(0);
                    n.setId(99L);
                    return n;
                });

        NoticiaDTO dto = new NoticiaDTO();
        dto.setTitulo("Nueva noticia de prueba");
        dto.setContenido("Contenido de la noticia");
        dto.setCategoria(NoticiaConstants.CAT_COMUNIDAD);
        dto.setAutorId(1L);
        dto.setEstado(NoticiaConstants.ESTADO_PUBLICADO); // Intentar forzar PUBLICADO


        NoticiaDTO resultado = noticiaService.guardar(dto);


        // El servicio debe ignorar el estado del DTO y establecer BORRADOR
        assertEquals(NoticiaConstants.ESTADO_BORRADOR, resultado.getEstado(),
                "El estado al crear siempre debe ser BORRADOR sin importar el DTO");

        verify(noticiaRepository).save(any(Noticia.class));
    }
}

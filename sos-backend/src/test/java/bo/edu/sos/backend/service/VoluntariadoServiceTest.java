package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.VoluntariadoDTO;
import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.entity.Voluntariado;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoluntariadoServiceTest {

    @Mock
    private VoluntariadoRepository voluntariadoRepository;

    @Mock
    private CentroRepository centroRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private VoluntariadoService voluntariadoService;

    @BeforeEach
    void setUp() {
        voluntariadoService = new VoluntariadoService(
                voluntariadoRepository,
                centroRepository,
                usuarioRepository
        );
    }

    @Test
    void listarTodosConsultaUnicamentePublicados() {
        Voluntariado publicado = crearPublicado();
        when(voluntariadoRepository.findByEstado("PUBLICADO"))
                .thenReturn(List.of(publicado));

        List<VoluntariadoDTO> resultado = voluntariadoService.listarTodos();

        assertEquals(1, resultado.size());
        assertEquals(publicado.getId(), resultado.get(0).getId());
        assertEquals("PUBLICADO", resultado.get(0).getEstado());
        verify(voluntariadoRepository).findByEstado("PUBLICADO");
        verifyNoMoreInteractions(voluntariadoRepository);
        verifyNoInteractions(centroRepository, usuarioRepository);
    }

    @Test
    void listarTodosIncluyeUbicacionDelCentroYConservaDatosExistentes() {
        Voluntariado publicado = crearPublicado();
        when(voluntariadoRepository.findByEstado("PUBLICADO"))
                .thenReturn(List.of(publicado));

        List<VoluntariadoDTO> resultado = voluntariadoService.listarTodos();

        assertEquals(1, resultado.size());
        VoluntariadoDTO dto = resultado.get(0);
        assertAll(
                () -> assertEquals(2L, dto.getCentroId()),
                () -> assertEquals("Centro de apoyo", dto.getCentroNombre()),
                () -> assertEquals("El Alto", dto.getCentroCiudad()),
                () -> assertEquals("La Paz", dto.getCentroDepartamento()),
                () -> assertEquals(publicado.getId(), dto.getId()),
                () -> assertEquals(publicado.getTitulo(), dto.getTitulo()),
                () -> assertEquals(publicado.getDescripcion(), dto.getDescripcion()),
                () -> assertEquals(publicado.getFechaInicio(), dto.getFechaInicio()),
                () -> assertEquals(publicado.getFechaFin(), dto.getFechaFin()),
                () -> assertEquals(publicado.getHabilidadesRequeridas(), dto.getHabilidadesRequeridas()),
                () -> assertEquals("PUBLICADO", dto.getEstado()),
                () -> assertEquals(4L, dto.getCreadoPorId())
        );
    }

    @Test
    void listarTodosDevuelveListaVaciaCuandoNoHayPublicados() {
        when(voluntariadoRepository.findByEstado("PUBLICADO"))
                .thenReturn(List.of());

        assertTrue(voluntariadoService.listarTodos().isEmpty());
        verify(voluntariadoRepository).findByEstado("PUBLICADO");
        verifyNoMoreInteractions(voluntariadoRepository);
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 3})
    void listarTodosIncluyeIdYNombreDeCadaNecesidadDelCentro(int cantidad) {
        Voluntariado publicado = crearPublicado();
        for (long id = cantidad; id >= 1; id--) {
            Necesidad necesidad = new Necesidad();
            necesidad.setId(id);
            necesidad.setNombre("Necesidad " + id);
            publicado.getCentro().getNecesidades().add(necesidad);
        }
        when(voluntariadoRepository.findByEstado("PUBLICADO"))
                .thenReturn(List.of(publicado));

        var necesidades = voluntariadoService.listarTodos().get(0).getCentroNecesidades();

        assertEquals(cantidad, necesidades.size());
        for (int indice = 0; indice < cantidad; indice++) {
            assertEquals(indice + 1L, necesidades.get(indice).getId());
            assertEquals("Necesidad " + (indice + 1), necesidades.get(indice).getNombre());
        }
    }

    @Test
    void listarTodosDevuelveColeccionVaciaParaCentroSinNecesidades() {
        when(voluntariadoRepository.findByEstado("PUBLICADO"))
                .thenReturn(List.of(crearPublicado()));

        assertEquals(List.of(), voluntariadoService.listarTodos().get(0).getCentroNecesidades());
    }

    @Test
    void listarTodosMantieneLasNecesidadesAsociadasACadaCentro() {
        Voluntariado primero = crearPublicado();
        Necesidad necesidad = new Necesidad();
        necesidad.setId(7L);
        necesidad.setNombre("Apoyo educativo");
        primero.getCentro().getNecesidades().add(necesidad);
        Voluntariado segundo = crearPublicado();
        segundo.setId(5L);
        segundo.getCentro().setId(6L);
        when(voluntariadoRepository.findByEstado("PUBLICADO"))
                .thenReturn(List.of(primero, segundo));

        var resultado = voluntariadoService.listarTodos();

        assertEquals(7L, resultado.get(0).getCentroNecesidades().get(0).getId());
        assertTrue(resultado.get(1).getCentroNecesidades().isEmpty());
    }

    @Test
    void listarTodosToleraCentroNulo() {
        Voluntariado publicado = crearPublicado();
        publicado.setCentro(null);
        when(voluntariadoRepository.findByEstado("PUBLICADO"))
                .thenReturn(List.of(publicado));

        VoluntariadoDTO dto = voluntariadoService.listarTodos().get(0);

        assertAll(
                () -> assertNull(dto.getCentroId()),
                () -> assertNull(dto.getCentroNombre()),
                () -> assertNull(dto.getCentroCiudad()),
                () -> assertNull(dto.getCentroDepartamento()),
                () -> assertEquals(List.of(), dto.getCentroNecesidades()),
                () -> assertEquals(publicado.getTitulo(), dto.getTitulo())
        );
    }

    @Test
    void listarTodosToleraDepartamentoNuloYConservaCiudad() {
        Voluntariado publicado = crearPublicado();
        publicado.getCentro().setDepartamento(null);
        when(voluntariadoRepository.findByEstado("PUBLICADO"))
                .thenReturn(List.of(publicado));

        VoluntariadoDTO dto = voluntariadoService.listarTodos().get(0);

        assertAll(
                () -> assertEquals("Centro de apoyo", dto.getCentroNombre()),
                () -> assertEquals("El Alto", dto.getCentroCiudad()),
                () -> assertNull(dto.getCentroDepartamento())
        );
    }

    private Voluntariado crearPublicado() {
        Departamento departamento = new Departamento();
        departamento.setId(3L);
        departamento.setNombre("La Paz");

        Centro centro = new Centro();
        centro.setId(2L);
        centro.setNombre("Centro de apoyo");
        centro.setCiudad("El Alto");
        centro.setDepartamento(departamento);

        Usuario creador = new Usuario();
        creador.setId(4L);

        Voluntariado voluntariado = new Voluntariado();
        voluntariado.setId(1L);
        voluntariado.setTitulo("Clasificación de donaciones");
        voluntariado.setDescripcion("Organizar las donaciones recibidas por el centro");
        voluntariado.setFechaInicio(LocalDateTime.of(2026, 10, 12, 9, 0));
        voluntariado.setFechaFin(LocalDateTime.of(2026, 10, 12, 17, 0));
        voluntariado.setHabilidadesRequeridas("Organización y trabajo en equipo");
        voluntariado.setEstado("PUBLICADO");
        voluntariado.setCentro(centro);
        voluntariado.setCreadoPor(creador);
        return voluntariado;
    }
}

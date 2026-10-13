package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.entity.Voluntariado;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import bo.edu.sos.backend.service.VoluntariadoService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class VoluntariadoControllerTest {

    @Test
    void listarPublicadosSerializaHorariosLocalesSinDesplazamientoNiOffset() throws Exception {
        Voluntariado voluntariado = new Voluntariado();
        voluntariado.setId(1L);
        voluntariado.setEstado("PUBLICADO");
        voluntariado.setFechaInicio(LocalDateTime.of(2026, 10, 15, 9, 0));
        voluntariado.setFechaFin(LocalDateTime.of(2026, 10, 15, 16, 0));

        VoluntariadoRepository repository = mock(VoluntariadoRepository.class);
        when(repository.findByEstado("PUBLICADO")).thenReturn(List.of(voluntariado));
        VoluntariadoService service = new VoluntariadoService(
                repository, mock(CentroRepository.class), mock(UsuarioRepository.class)
        );
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new VoluntariadoController(service)).build();

        mvc.perform(get("/api/voluntariados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].centroNecesidades").isEmpty())
                .andExpect(jsonPath("$.data[0].fechaInicio").value("2026-10-15T09:00:00"))
                .andExpect(jsonPath("$.data[0].fechaFin").value("2026-10-15T16:00:00"));
    }

    @Test
    void listarPublicadosSerializaNecesidadesConIdYNombreYArrayVacioCuandoNoHay() throws Exception {
        Necesidad necesidad = new Necesidad();
        necesidad.setId(7L);
        necesidad.setNombre("Apoyo educativo");
        necesidad.setDescripcion("Detalle interno que no forma parte del resumen");
        Centro centro = new Centro();
        centro.getNecesidades().add(necesidad);
        Voluntariado conNecesidades = new Voluntariado();
        conNecesidades.setCentro(centro);
        Voluntariado sinNecesidades = new Voluntariado();
        sinNecesidades.setCentro(new Centro());

        VoluntariadoRepository repository = mock(VoluntariadoRepository.class);
        when(repository.findByEstado("PUBLICADO"))
                .thenReturn(List.of(conNecesidades, sinNecesidades));
        VoluntariadoService service = new VoluntariadoService(
                repository, mock(CentroRepository.class), mock(UsuarioRepository.class)
        );
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new VoluntariadoController(service)).build();

        mvc.perform(get("/api/voluntariados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].centroNecesidades.length()").value(1))
                .andExpect(jsonPath("$.data[0].centroNecesidades[0].id").value(7))
                .andExpect(jsonPath("$.data[0].centroNecesidades[0].nombre").value("Apoyo educativo"))
                .andExpect(jsonPath("$.data[0].centroNecesidades[0].descripcion").doesNotExist())
                .andExpect(jsonPath("$.data[1].centroNecesidades").isArray())
                .andExpect(jsonPath("$.data[1].centroNecesidades").isEmpty());
    }
}

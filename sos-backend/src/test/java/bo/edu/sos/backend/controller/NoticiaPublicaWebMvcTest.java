package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.config.SecurityConfig;
import bo.edu.sos.backend.constants.NoticiaConstants;
import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.entity.Noticia;
import bo.edu.sos.backend.repository.NoticiaRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.security.JwtAuthenticationFilter;
import bo.edu.sos.backend.security.JwtService;
import bo.edu.sos.backend.service.NoticiaExternaService;
import bo.edu.sos.backend.service.NoticiaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** MVC y seguridad reales, con servicio real y repositorios simulados: no usa MySQL. */
@WebMvcTest(NoticiaController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, NoticiaService.class})
class NoticiaPublicaWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NoticiaRepository noticiaRepository;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private NoticiaExternaService noticiaExternaService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void detallePublicadoSinSesionDevuelveContenidoCompletoFechaYFuente() throws Exception {
        Noticia noticia = crearNoticia(NoticiaConstants.ESTADO_PUBLICADO);
        when(noticiaRepository.findById(7L)).thenReturn(Optional.of(noticia));

        mockMvc.perform(get("/api/noticias/publicas/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(7))
                .andExpect(jsonPath("$.data.titulo").value(noticia.getTitulo()))
                .andExpect(jsonPath("$.data.contenido").value(noticia.getContenido()))
                .andExpect(jsonPath("$.data.fechaPublicacion").value("2026-10-12T09:30:00"))
                .andExpect(jsonPath("$.data.fuente").value("Defensa Civil Bolivia"))
                .andExpect(jsonPath("$.data.estado").value("PUBLICADO"))
                .andExpect(jsonPath("$.data.esExterna").value(false));

        verifyNoInteractions(usuarioRepository, jwtService);
    }

    @Test
    void detallePublicadoNoInventaFechaNiFuente() throws Exception {
        Noticia noticia = crearNoticia(NoticiaConstants.ESTADO_PUBLICADO);
        noticia.setFechaPublicacion(null);
        noticia.setFuente(null);
        when(noticiaRepository.findById(7L)).thenReturn(Optional.of(noticia));

        mockMvc.perform(get("/api/noticias/publicas/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fechaPublicacion").value(nullValue()))
                .andExpect(jsonPath("$.data.fuente").value(nullValue()));
    }

    @Test
    void detalleInexistenteSinSesionDevuelve404() throws Exception {
        when(noticiaRepository.findById(7L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/noticias/publicas/7"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"BORRADOR", "ARCHIVADO", "RECHAZADO", "publicado", "PUBLICADO "})
    void detalleNoPublicadoSinSesionDevuelve404SinContenido(String estado) throws Exception {
        when(noticiaRepository.findById(7L)).thenReturn(Optional.of(crearNoticia(estado)));

        mockMvc.perform(get("/api/noticias/publicas/7"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void consultaPorIdExistenteConservaSuComportamiento() throws Exception {
        when(noticiaRepository.findById(7L))
                .thenReturn(Optional.of(crearNoticia(NoticiaConstants.ESTADO_BORRADOR)));

        mockMvc.perform(get("/api/noticias/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estado").value("BORRADOR"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"POST", "PUT", "DELETE"})
    void escrituraAdministrativaSinSesionSigueProtegida(String metodo) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(metodo), URI.create(rutaEscritura(metodo)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(noticiaRepository, usuarioRepository);
    }

    @ParameterizedTest
    @ValueSource(strings = {"POST", "PUT", "DELETE"})
    @WithMockUser(authorities = Roles.USER)
    void escrituraAdministrativaRechazaUsuarioSinPermisos(String metodo) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(metodo), URI.create(rutaEscritura(metodo)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(noticiaRepository, usuarioRepository);
    }

    @Test
    @WithMockUser(authorities = Roles.ADMIN)
    void administradorPuedeSeguirCreandoNoticias() throws Exception {
        when(noticiaRepository.save(any(Noticia.class))).thenAnswer(invocation -> {
            Noticia noticia = invocation.getArgument(0);
            noticia.setId(8L);
            return noticia;
        });

        mockMvc.perform(post("/api/noticias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "Nueva noticia",
                                  "contenido": "Contenido de la noticia",
                                  "categoria": "Comunidad"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(8))
                .andExpect(jsonPath("$.data.estado").value("BORRADOR"));
    }

    private String rutaEscritura(String metodo) {
        return "POST".equals(metodo) ? "/api/noticias" : "/api/noticias/7";
    }

    private Noticia crearNoticia(String estado) {
        Noticia noticia = new Noticia();
        noticia.setId(7L);
        noticia.setTitulo("Campaña solidaria");
        noticia.setContenido("Primer párrafo.\n\n" + "Contenido completo sin recortes. ".repeat(30));
        noticia.setCategoria(NoticiaConstants.CAT_COMUNIDAD);
        noticia.setEstado(estado);
        noticia.setFechaPublicacion(LocalDateTime.of(2026, 10, 12, 9, 30));
        noticia.setFuente("Defensa Civil Bolivia");
        return noticia;
    }
}

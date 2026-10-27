package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import bo.edu.sos.backend.repository.EventoPublicacionAlertaRepository;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** MVC, seguridad y persistencia reales sobre un MySQL aislado; cada caso se revierte. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AlertaPublicacionIntegrationTest {
    private static final String EMAIL = "revisor-alertas@example.com";
    private static final String BORRADOR = """
            {
              "titulo": "Crecida del río",
              "departamentoId": 3,
              "severidad": "ALTA",
              "mensaje": "Evitar cruzar el río.",
              "fechaPublicacion": "2027-10-15T09:00:00",
              "fechaExpiracion": "2027-10-16T09:00:00",
              "fuente": "SENAMHI"
            }
            """;

    @Autowired private MockMvc mvc;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private RolRepository roles;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private jakarta.persistence.EntityManager entityManager;
    @MockitoSpyBean private EventoPublicacionAlertaRepository eventoRepository;
    private Long administradorId;

    @BeforeEach
    void prepararAdministrador() {
        var existente = usuarios.findByEmail(EMAIL);
        if (existente.isPresent()) {
            administradorId = existente.get().getId();
            return;
        }
        Usuario administrador = new Usuario();
        administrador.setNombre("Revisor de prueba");
        administrador.setEmail(EMAIL);
        administrador.setPassword("valor-sintetico-no-utilizado-en-login");
        administrador.setRol(roles.findByNombre(Roles.ADMIN).orElseThrow());
        administradorId = usuarios.saveAndFlush(administrador).getId();
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void revisarNoPublicaYConfirmarPublicaConEventoPersistido() throws Exception {
        String ubicacion = crearBorrador();
        String revision = mvc.perform(get(ubicacion + "/revision"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.titulo").value("Crecida del río"))
                .andExpect(jsonPath("$.data.mensaje").value("Evitar cruzar el río."))
                .andExpect(jsonPath("$.data.fuente").value("SENAMHI"))
                .andExpect(jsonPath("$.data.departamentoId").value(3))
                .andExpect(jsonPath("$.data.severidad").value("ALTA"))
                .andExpect(jsonPath("$.data.estado").value("BORRADOR"))
                .andExpect(jsonPath("$.data.version").value(0))
                .andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(revision, "$.data.id");
        assertEquals(0, eventos(id.longValue()));

        mvc.perform(post(ubicacion + "/publicar").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"confirmado\":true,\"version\":0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estado").value("ACTIVA"));
        mvc.perform(get(ubicacion))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estado").value("ACTIVA"));
        assertEquals(1, eventos(id.longValue()));
        var evento = jdbc.queryForMap("SELECT * FROM evento_publicacion_alerta WHERE alerta_id = ?", id);
        assertEquals(administradorId.longValue(), ((Number) evento.get("administrador_id")).longValue());
        assertEquals("BORRADOR", evento.get("estado_anterior"));
        assertEquals("ACTIVA", evento.get("estado_nuevo"));
        assertNotNull(evento.get("fecha"));
    }

    private String crearBorrador() throws Exception {
        return mvc.perform(post("/api/alertas").contentType(MediaType.APPLICATION_JSON).content(BORRADOR))
                .andExpect(status().isCreated()).andReturn().getResponse().getHeader("Location");
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void noPermitePublicarConLaEdicionGenerica() throws Exception {
        String ubicacion = crearBorrador();
        String edicion = BORRADOR.replace("\"titulo\":", "\"estado\":\"ACTIVA\",\"version\":0,\"creadoPorId\":"
                + administradorId + ",\"titulo\":");
        mvc.perform(put(ubicacion).contentType(MediaType.APPLICATION_JSON).content(edicion))
                .andExpect(status().isBadRequest());
        mvc.perform(get(ubicacion + "/revision"))
                .andExpect(jsonPath("$.data.estado").value("BORRADOR"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"version\":0}", "{\"confirmado\":false,\"version\":0}",
            "{\"confirmado\":true}", "{\"confirmado\":true,\"version\":-1}"})
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void exigeConfirmacionYVersionValidasSinPublicar(String solicitud) throws Exception {
        String ubicacion = crearBorrador();
        mvc.perform(post(ubicacion + "/publicar").contentType(MediaType.APPLICATION_JSON).content(solicitud))
                .andExpect(status().isUnprocessableEntity());
        mvc.perform(get(ubicacion + "/revision")).andExpect(jsonPath("$.data.estado").value("BORRADOR"));
        assertEquals(0, eventos(id(ubicacion)));
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/alertas/borradores", "/api/alertas/1/revision"})
    void revisionSinSesionDevuelve401(String ruta) throws Exception {
        mvc.perform(get(ruta)).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/alertas/borradores", "/api/alertas/1/revision"})
    @WithMockUser(username = EMAIL, authorities = Roles.USER)
    void revisionParaUsuarioNormalDevuelve403(String ruta) throws Exception {
        mvc.perform(get(ruta)).andExpect(status().isForbidden());
    }

    @Test
    void publicacionSinSesionDevuelve401() throws Exception {
        mvc.perform(post("/api/alertas/1/publicar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"confirmado\":true,\"version\":0}")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.USER)
    void publicacionParaUsuarioNormalDevuelve403() throws Exception {
        mvc.perform(post("/api/alertas/1/publicar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"confirmado\":true,\"version\":0}")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void alertaInexistenteNoSePuedeRevisarNiPublicar() throws Exception {
        mvc.perform(get("/api/alertas/999999/revision")).andExpect(status().isNotFound());
        mvc.perform(post("/api/alertas/999999/publicar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"confirmado\":true,\"version\":0}")).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void cambiosPosterioresARevisionRequierenRevisarOtraVez() throws Exception {
        String ubicacion = crearBorrador();
        String edicion = BORRADOR.replace("\"titulo\":", "\"version\":0,\"creadoPorId\":"
                + administradorId + ",\"titulo\":").replace("Crecida del río", "Alerta corregida");
        mvc.perform(put(ubicacion).contentType(MediaType.APPLICATION_JSON).content(edicion))
                .andExpect(status().isOk());
        mvc.perform(post(ubicacion + "/publicar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"confirmado\":true,\"version\":0}")).andExpect(status().isConflict());
        assertEquals(0, eventos(id(ubicacion)));
        mvc.perform(get(ubicacion + "/revision"))
                .andExpect(jsonPath("$.data.titulo").value("Alerta corregida"))
                .andExpect(jsonPath("$.data.version").value(1));
        mvc.perform(post(ubicacion + "/publicar").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"confirmado\":true,\"version\":1}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.estado").value("ACTIVA"));
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void consultasPublicasOcultanBorradoresYLaPublicacionLosHaceVisibles() throws Exception {
        String ubicacion = crearBorrador();
        long id = id(ubicacion);
        mvc.perform(get(ubicacion).with(anonymous())).andExpect(status().isNotFound());
        mvc.perform(get(ubicacion).with(user("lector").authorities(new SimpleGrantedAuthority(Roles.USER))))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/alertas").with(anonymous())).andExpect(jsonPath("$.data[?(@.id == " + id + ")]").isEmpty());
        mvc.perform(get("/api/alertas/departamento/3").with(anonymous()))
                .andExpect(jsonPath("$.data[?(@.id == " + id + ")]").isEmpty());
        mvc.perform(get("/api/alertas/borradores"))
                .andExpect(jsonPath("$.data[?(@.id == " + id + ")]").isNotEmpty());
        mvc.perform(post(ubicacion + "/publicar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"confirmado\":true,\"version\":0}")).andExpect(status().isOk());
        mvc.perform(get(ubicacion).with(anonymous())).andExpect(status().isOk());
        mvc.perform(get("/api/alertas").with(anonymous())).andExpect(jsonPath("$.data[?(@.id == " + id + ")]").isNotEmpty());
        mvc.perform(get("/api/alertas/departamento/3").with(anonymous()))
                .andExpect(jsonPath("$.data[?(@.id == " + id + ")]").isNotEmpty());
        mvc.perform(get("/api/alertas/borradores"))
                .andExpect(jsonPath("$.data[?(@.id == " + id + ")]").isEmpty());
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void publicarDeNuevoNoDuplicaElEventoNiPermiteEditarLoPublicado() throws Exception {
        String ubicacion = crearBorrador();
        mvc.perform(post(ubicacion + "/publicar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"confirmado\":true,\"version\":0}")).andExpect(status().isOk());
        mvc.perform(post(ubicacion + "/publicar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"confirmado\":true,\"version\":1}")).andExpect(status().isConflict());
        String edicion = BORRADOR.replace("\"titulo\":", "\"version\":1,\"creadoPorId\":"
                + administradorId + ",\"titulo\":");
        mvc.perform(put(ubicacion).contentType(MediaType.APPLICATION_JSON).content(edicion))
                .andExpect(status().isBadRequest());
        mvc.perform(delete(ubicacion)).andExpect(status().isBadRequest());
        assertEquals(1, eventos(id(ubicacion)));
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void noPublicaBorradorHistoricoSinFuente() throws Exception {
        String ubicacion = crearBorrador();
        jdbc.update("UPDATE alerta SET fuente = NULL WHERE id = ?", id(ubicacion));
        // Evitar que el contexto JPA conserve la fuente anterior al cambio de datos históricos.
        entityManager.clear();
        mvc.perform(post(ubicacion + "/publicar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"confirmado\":true,\"version\":0}")).andExpect(status().isBadRequest());
        assertEquals(0, eventos(id(ubicacion)));
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void falloAlPersistirEventoRevierteLaPublicacion() throws Exception {
        String ubicacion = crearBorrador();
        try {
            doThrow(new DataIntegrityViolationException("Fallo simulado en el almacenamiento del evento"))
                    .when(eventoRepository).saveAndFlush(any());
            mvc.perform(post(ubicacion + "/publicar").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"confirmado\":true,\"version\":0}")).andExpect(status().isConflict());
            mvc.perform(get(ubicacion + "/revision"))
                    .andExpect(jsonPath("$.data.estado").value("BORRADOR"))
                    .andExpect(jsonPath("$.data.version").value(0));
            assertEquals(0, eventos(id(ubicacion)));
        } finally {
            jdbc.update("DELETE FROM alerta WHERE id = ?", id(ubicacion));
        }
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void publicacionesConcurrentesGeneranUnSoloEvento() throws Exception {
        String ubicacion = crearBorrador();
        var ejecutor = Executors.newFixedThreadPool(2);
        var preparados = new CountDownLatch(2);
        var inicio = new CountDownLatch(1);
        java.util.concurrent.Callable<Integer> publicar = () -> {
            preparados.countDown();
            assertTrue(inicio.await(10, TimeUnit.SECONDS));
            return mvc.perform(post(ubicacion + "/publicar")
                            .with(user(EMAIL).authorities(new SimpleGrantedAuthority(Roles.ADMIN)))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"confirmado\":true,\"version\":0}"))
                    .andReturn().getResponse().getStatus();
        };
        try {
            var primera = ejecutor.submit(publicar);
            var segunda = ejecutor.submit(publicar);
            assertTrue(preparados.await(10, TimeUnit.SECONDS));
            inicio.countDown();
            var resultados = List.of(primera.get(20, TimeUnit.SECONDS), segunda.get(20, TimeUnit.SECONDS))
                    .stream().sorted().toList();
            assertEquals(List.of(200, 409), resultados);
            assertEquals(1, eventos(id(ubicacion)));
        } finally {
            inicio.countDown();
            ejecutor.shutdownNow();
            assertTrue(ejecutor.awaitTermination(10, TimeUnit.SECONDS));
            jdbc.update("DELETE FROM evento_publicacion_alerta WHERE alerta_id = ?", id(ubicacion));
            jdbc.update("DELETE FROM alerta WHERE id = ?", id(ubicacion));
        }
    }

    private long id(String ubicacion) {
        return Long.parseLong(ubicacion.substring(ubicacion.lastIndexOf('/') + 1));
    }

    private int eventos(long id) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM evento_publicacion_alerta WHERE alerta_id = ?",
                Integer.class, id);
    }
}

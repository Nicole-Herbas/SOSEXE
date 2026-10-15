package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.repository.RolRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Ejecutar con un datasource MySQL de prueba; cada caso se revierte al terminar. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AlertaCreacionIntegrationTest {
    private static final String EMAIL = "admin-alertas@example.com";
    private static final String SOLICITUD = """
            {
              "titulo": "  Crecida del río  ",
              "departamentoId": 3,
              "severidad": "ALTA",
              "mensaje": "  Evitar cruzar el río.  ",
              "fechaPublicacion": "2026-10-15T09:00:00",
              "fechaExpiracion": "2026-10-16T09:00:00",
              "fuente": "  SENAMHI  "
            }
            """;

    @Autowired private MockMvc mvc;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private RolRepository roles;
    @Autowired private EntityManager entityManager;
    private Long creadorId;
    private int alertasPrevias;

    @BeforeEach
    void prepararAdministrador() throws Exception {
        Usuario administrador = new Usuario();
        administrador.setNombre("Administrador de prueba");
        administrador.setEmail(EMAIL);
        administrador.setPassword("valor-sintetico-no-utilizado-en-login");
        administrador.setRol(roles.findByNombre(Roles.ADMIN).orElseThrow());
        creadorId = usuarios.saveAndFlush(administrador).getId();
        String listado = mvc.perform(get("/api/alertas"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        alertasPrevias = JsonPath.read(listado, "$.data.length()");
    }

    @ParameterizedTest
    @ValueSource(strings = {"BAJA", "MEDIA", "ALTA", "CRITICA"})
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void administradorCreaYRecuperaAlertaConLosSeisCamposPersistidos(String severidad) throws Exception {
        String ubicacion = mvc.perform(post("/api/alertas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(SOLICITUD.replace("\"ALTA\"", "\"" + severidad + "\"")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.creadoPorId").value(creadorId))
                .andExpect(jsonPath("$.data.estado").value("BORRADOR"))
                .andReturn().getResponse().getHeader("Location");

        org.junit.jupiter.api.Assertions.assertNotNull(ubicacion);
        entityManager.flush();
        entityManager.clear();
        mvc.perform(get(ubicacion))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.titulo").value("Crecida del río"))
                .andExpect(jsonPath("$.data.departamentoId").value(3))
                .andExpect(jsonPath("$.data.severidad").value(severidad))
                .andExpect(jsonPath("$.data.mensaje").value("Evitar cruzar el río."))
                .andExpect(jsonPath("$.data.fechaPublicacion").value("2026-10-15T09:00:00"))
                .andExpect(jsonPath("$.data.fechaExpiracion").value("2026-10-16T09:00:00"))
                .andExpect(jsonPath("$.data.fuente").value("SENAMHI"));
    }

    @Test
    void crearSinSesionDevuelve401() throws Exception {
        mvc.perform(post("/api/alertas").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.USER)
    void usuarioNormalNoPuedeCrearAlertas() throws Exception {
        mvc.perform(post("/api/alertas").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void clienteNoPuedeSuplantarCreadorNiPublicarAlCrear() throws Exception {
        String solicitud = SOLICITUD.replace("\"titulo\":", "\"creadoPorId\": 999999, \"estado\": \"ACTIVA\", \"titulo\":");
        mvc.perform(post("/api/alertas").contentType(MediaType.APPLICATION_JSON).content(solicitud))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.creadoPorId").value(creadorId))
                .andExpect(jsonPath("$.data.estado").value("BORRADOR"));
    }

    @ParameterizedTest
    @MethodSource("solicitudesInvalidas")
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void datosInvalidosDevuelven422SinCrearAlertas(String original, String reemplazo, String campo) throws Exception {
        mvc.perform(post("/api/alertas").contentType(MediaType.APPLICATION_JSON)
                        .content(SOLICITUD.replace(original, reemplazo)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.data." + campo).isString());
        mvc.perform(get("/api/alertas")).andExpect(jsonPath("$.data.length()").value(alertasPrevias));
    }

    private static Stream<Arguments> solicitudesInvalidas() {
        return Stream.of(
                Arguments.of("\"  Crecida del río  \"", "\"   \"", "titulo"),
                Arguments.of("\"  Crecida del río  \"", "null", "titulo"),
                Arguments.of("\"  Crecida del río  \"", "\"" + "t".repeat(221) + "\"", "titulo"),
                Arguments.of("\"departamentoId\": 3", "\"departamentoId\": null", "departamentoId"),
                Arguments.of("\"departamentoId\": 3", "\"departamentoId\": 0", "departamentoId"),
                Arguments.of("\"ALTA\"", "null", "severidad"),
                Arguments.of("\"ALTA\"", "\"URGENTE\"", "severidad"),
                Arguments.of("\"  Evitar cruzar el río.  \"", "\"   \"", "mensaje"),
                Arguments.of("\"  Evitar cruzar el río.  \"", "null", "mensaje"),
                Arguments.of("\"  Evitar cruzar el río.  \"", "\"" + "m".repeat(1001) + "\"", "mensaje"),
                Arguments.of("\"2026-10-15T09:00:00\"", "null", "fechaPublicacion"),
                Arguments.of("\"2026-10-16T09:00:00\"", "null", "fechaExpiracion"),
                Arguments.of("\"2026-10-16T09:00:00\"", "\"2026-10-15T09:00:00\"", "vigenciaValida"),
                Arguments.of("\"2026-10-16T09:00:00\"", "\"2026-10-14T09:00:00\"", "vigenciaValida"),
                Arguments.of("\"  SENAMHI  \"", "\"   \"", "fuente"),
                Arguments.of("\"  SENAMHI  \"", "null", "fuente"),
                Arguments.of("\"  SENAMHI  \"", "\"" + "f".repeat(251) + "\"", "fuente")
        );
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void departamentoInexistenteDevuelve404SinCrearAlerta() throws Exception {
        mvc.perform(post("/api/alertas").contentType(MediaType.APPLICATION_JSON)
                        .content(SOLICITUD.replace("\"departamentoId\": 3", "\"departamentoId\": 999999")))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/alertas")).andExpect(jsonPath("$.data.length()").value(alertasPrevias));
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void fechaMalformadaDevuelve400() throws Exception {
        mvc.perform(post("/api/alertas").contentType(MediaType.APPLICATION_JSON)
                        .content(SOLICITUD.replace("2026-10-15T09:00:00", "no-es-fecha")))
                .andExpect(status().isBadRequest());
    }
}

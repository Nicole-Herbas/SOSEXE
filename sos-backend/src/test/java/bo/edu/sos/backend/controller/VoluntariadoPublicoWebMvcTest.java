package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.config.SecurityConfig;
import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.entity.*;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import bo.edu.sos.backend.security.JwtAuthenticationFilter;
import bo.edu.sos.backend.security.JwtService;
import bo.edu.sos.backend.service.VoluntariadoService;
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
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Servicio, MVC y filtros de seguridad reales; repositorios simulados, sin datasource. */
@WebMvcTest(VoluntariadoController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, VoluntariadoService.class})
class VoluntariadoPublicoWebMvcTest {

    private static final String EMAIL = "persona@example.com";
    private static final String SOLICITUD = """
            {
              "titulo": "Apoyo al centro",
              "descripcion": "Organizar donaciones",
              "habilidadesRequeridas": "Organización",
              "fechaInicio": "2026-10-15T09:00:00",
              "fechaFin": "2026-10-15T16:00:00",
              "centroId": 2
            }
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private VoluntariadoRepository voluntariadoRepository;

    @MockitoBean
    private CentroRepository centroRepository;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void detalleSinSesionConservaDatosCompletosYHorariosSinExponerDatosPersonales() throws Exception {
        Voluntariado oportunidad = crearOportunidad("PUBLICADO");
        when(voluntariadoRepository.findById(1L)).thenReturn(Optional.of(oportunidad));

        mvc.perform(get("/api/voluntariados/publicos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.titulo").value(oportunidad.getTitulo()))
                .andExpect(jsonPath("$.data.descripcion").value(oportunidad.getDescripcion()))
                .andExpect(jsonPath("$.data.habilidadesRequeridas").value("Organización y trabajo en equipo"))
                .andExpect(jsonPath("$.data.fechaInicio").value("2026-10-15T09:00:00"))
                .andExpect(jsonPath("$.data.fechaFin").value("2026-10-15T16:00:00"))
                .andExpect(jsonPath("$.data.centroId").value(2))
                .andExpect(jsonPath("$.data.centroNombre").value("Centro de apoyo"))
                .andExpect(jsonPath("$.data.centroCiudad").value("El Alto"))
                .andExpect(jsonPath("$.data.centroDepartamento").value("La Paz"))
                .andExpect(jsonPath("$.data.centroNecesidades[0].id").value(7))
                .andExpect(jsonPath("$.data.estado").value("PUBLICADO"))
                .andExpect(jsonPath("$.data.creadoPorId").value(nullValue()))
                .andExpect(jsonPath("$.data.creadoPor").doesNotExist())
                .andExpect(jsonPath("$.data.responsable").doesNotExist())
                .andExpect(jsonPath("$.data.perfilVoluntario").doesNotExist())
                .andExpect(content().string(not(containsString("Dato personal protegido"))))
                .andExpect(content().string(not(containsString("privado@example.com"))))
                .andExpect(content().string(not(containsString("clave-privada-de-prueba"))));

        verifyNoInteractions(centroRepository, usuarioRepository, jwtService);
    }

    @Test
    void detalleSinHabilidadesDevuelveNullSinInventarlas() throws Exception {
        Voluntariado oportunidad = crearOportunidad("PUBLICADO");
        oportunidad.setHabilidadesRequeridas(null);
        when(voluntariadoRepository.findById(1L)).thenReturn(Optional.of(oportunidad));

        mvc.perform(get("/api/voluntariados/publicos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.habilidadesRequeridas").value(nullValue()));
        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void oportunidadInexistenteSinSesionDevuelve404() throws Exception {
        when(voluntariadoRepository.findById(1L)).thenReturn(Optional.empty());

        mvc.perform(get("/api/voluntariados/publicos/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"BORRADOR", "CERRADO", "FINALIZADO", "CANCELADO", "RECHAZADO", "publicado", "PUBLICADO "})
    void oportunidadNoPublicadaSinSesionDevuelve404SinDatos(String estado) throws Exception {
        when(voluntariadoRepository.findById(1L)).thenReturn(Optional.of(crearOportunidad(estado)));

        mvc.perform(get("/api/voluntariados/publicos/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void listadoSos54ConservaContratoYDatosParaFiltrosSos55() throws Exception {
        when(voluntariadoRepository.findByEstado("PUBLICADO"))
                .thenReturn(List.of(crearOportunidad("PUBLICADO")));

        mvc.perform(get("/api/voluntariados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].centroCiudad").value("El Alto"))
                .andExpect(jsonPath("$.data[0].centroNecesidades[0].nombre").value("Apoyo educativo"))
                .andExpect(jsonPath("$.data[0].creadoPorId").value(4));
        verify(voluntariadoRepository).findByEstado("PUBLICADO");
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/voluntariados/1", "/api/voluntariados/centro/2"})
    void consultasAntiguasMantienenContratoMientrasSeRevisaSuVisibilidad(String ruta) throws Exception {
        Voluntariado borrador = crearOportunidad("BORRADOR");
        when(voluntariadoRepository.findById(1L)).thenReturn(Optional.of(borrador));
        when(voluntariadoRepository.findByCentroId(2L)).thenReturn(List.of(borrador));
        String datos = ruta.contains("/centro/") ? "$.data[0]" : "$.data";

        mvc.perform(get(ruta))
                .andExpect(status().isOk())
                .andExpect(jsonPath(datos + ".estado").value("BORRADOR"))
                .andExpect(jsonPath(datos + ".creadoPorId").value(4));
    }

    @ParameterizedTest
    @ValueSource(strings = {"POST", "PUT", "DELETE"})
    void escrituraSinSesionSigueRechazada(String metodo) throws Exception {
        mvc.perform(request(HttpMethod.valueOf(metodo), URI.create(rutaEscritura(metodo)))
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(voluntariadoRepository, centroRepository, usuarioRepository);
    }

    @ParameterizedTest
    @ValueSource(strings = {"POST", "PUT", "DELETE"})
    @WithMockUser(username = EMAIL, authorities = Roles.USER)
    void escrituraRechazaUsuariosQueNoAdministranElCentro(String metodo) throws Exception {
        prepararEscritura(20L, Roles.USER);

        mvc.perform(request(HttpMethod.valueOf(metodo), URI.create(rutaEscritura(metodo)))
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isForbidden());
        verify(voluntariadoRepository, never()).save(any());
        verify(voluntariadoRepository, never()).delete(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"POST", "PUT", "DELETE"})
    @WithMockUser(username = EMAIL, authorities = Roles.USER)
    void responsableConservaPermisosDeEscritura(String metodo) throws Exception {
        prepararEscritura(10L, Roles.USER);
        if (!"DELETE".equals(metodo)) {
            when(voluntariadoRepository.save(any(Voluntariado.class))).thenAnswer(invocacion -> {
                Voluntariado oportunidad = invocacion.getArgument(0);
                oportunidad.setId(1L);
                return oportunidad;
            });
        }

        mvc.perform(request(HttpMethod.valueOf(metodo), URI.create(rutaEscritura(metodo)))
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().is("POST".equals(metodo) ? 201 : 200))
                .andExpect(jsonPath("$.success").value(true));
        if ("DELETE".equals(metodo)) verify(voluntariadoRepository).delete(any(Voluntariado.class));
        else verify(voluntariadoRepository).save(any(Voluntariado.class));
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = Roles.ADMIN)
    void administradorConservaPermisoParaEliminarSinSerResponsable() throws Exception {
        prepararEscritura(20L, Roles.ADMIN);

        mvc.perform(delete("/api/voluntariados/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        verify(voluntariadoRepository).delete(any(Voluntariado.class));
    }

    private void prepararEscritura(Long usuarioId, String nombreRol) {
        Voluntariado oportunidad = crearOportunidad("PUBLICADO");
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        usuario.setEmail(EMAIL);
        Rol rol = new Rol();
        rol.setNombre(nombreRol);
        usuario.setRol(rol);
        when(usuarioRepository.findByEmail(EMAIL)).thenReturn(Optional.of(usuario));
        when(centroRepository.findById(2L)).thenReturn(Optional.of(oportunidad.getCentro()));
        when(voluntariadoRepository.findById(1L)).thenReturn(Optional.of(oportunidad));
    }

    private String rutaEscritura(String metodo) {
        return "POST".equals(metodo) ? "/api/voluntariados" : "/api/voluntariados/1";
    }

    private Voluntariado crearOportunidad(String estado) {
        Usuario creador = new Usuario();
        creador.setId(4L);
        creador.setNombre("Dato personal protegido");
        creador.setEmail("privado@example.com");
        creador.setPassword("clave-privada-de-prueba");
        Usuario responsable = new Usuario();
        responsable.setId(10L);
        responsable.setNombre("Dato personal protegido");
        responsable.setEmail("privado@example.com");
        Departamento departamento = new Departamento();
        departamento.setId(3L);
        departamento.setNombre("La Paz");
        Centro centro = new Centro();
        centro.setId(2L);
        centro.setNombre("Centro de apoyo");
        centro.setCiudad("El Alto");
        centro.setDepartamento(departamento);
        centro.setResponsable(responsable);
        Necesidad necesidad = new Necesidad();
        necesidad.setId(7L);
        necesidad.setNombre("Apoyo educativo");
        centro.getNecesidades().add(necesidad);
        Voluntariado oportunidad = new Voluntariado();
        oportunidad.setId(1L);
        oportunidad.setTitulo("Clasificación de donaciones");
        oportunidad.setDescripcion("Descripción completa.\n\n" + "Detalle de la actividad. ".repeat(30));
        oportunidad.setHabilidadesRequeridas("Organización y trabajo en equipo");
        oportunidad.setFechaInicio(LocalDateTime.of(2026, 10, 15, 9, 0));
        oportunidad.setFechaFin(LocalDateTime.of(2026, 10, 15, 16, 0));
        oportunidad.setEstado(estado);
        oportunidad.setCentro(centro);
        oportunidad.setCreadoPor(creador);
        return oportunidad;
    }
}

package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.config.SecurityConfig;
import bo.edu.sos.backend.dto.PostulacionDTO;
import bo.edu.sos.backend.entity.*;
import bo.edu.sos.backend.repository.PerfilVoluntarioRepository;
import bo.edu.sos.backend.repository.PostulacionRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import bo.edu.sos.backend.security.JwtAuthenticationFilter;
import bo.edu.sos.backend.security.JwtService;
import bo.edu.sos.backend.service.PostulacionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** MVC, validación, servicio y seguridad reales; repositorios simulados, sin datasource ni Flyway. */
@WebMvcTest(PostulacionController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, PostulacionService.class})
class PostulacionWebMvcTest {

    private static final String EMAIL = "lucia@sos.org";
    private static final String SOLICITUD = """
            {"voluntariadoId":1,"disponibilidad":"Tarde","comentario":"Puedo colaborar"}
            """;

    @Autowired
    private MockMvc mvc;
    @MockitoBean
    private UsuarioRepository usuarioRepository;
    @MockitoBean
    private VoluntariadoRepository voluntariadoRepository;
    @MockitoBean
    private PostulacionRepository postulacionRepository;
    @MockitoBean
    private PerfilVoluntarioRepository perfilRepository;
    @MockitoBean
    private JwtService jwtService;

    private Usuario prepararUsuario(String rolNombre) {
        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setNombre("Lucía");
        usuario.setEmail(EMAIL);
        Rol rol = new Rol();
        rol.setNombre(rolNombre);
        usuario.setRol(rol);
        when(usuarioRepository.findByEmail(EMAIL)).thenReturn(Optional.of(usuario));
        return usuario;
    }

    private Voluntariado prepararSolicitudValida() {
        Usuario usuario = prepararUsuario("USER");
        PerfilVoluntario perfil = new PerfilVoluntario();
        perfil.setUsuario(usuario);
        perfil.setHabilidades("Organización,Logística");
        perfil.setDisponibilidad("Tarde");
        when(perfilRepository.findByUsuarioId(10L)).thenReturn(Optional.of(perfil));
        Voluntariado oportunidad = new Voluntariado();
        oportunidad.setId(1L);
        oportunidad.setTitulo("Organizar donaciones");
        oportunidad.setEstado("PUBLICADO");
        oportunidad.setFechaFin(LocalDateTime.of(2099, 10, 15, 16, 0));
        Centro centro = new Centro();
        centro.setResponsable(usuario);
        oportunidad.setCentro(centro);
        when(voluntariadoRepository.findById(1L)).thenReturn(Optional.of(oportunidad));
        return oportunidad;
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void postDevuelve201PendienteEIgnoraUsuarioYEstadoEnviadosPorCliente() throws Exception {
        prepararSolicitudValida();
        when(postulacionRepository.saveAndFlush(any())).thenAnswer(invocacion -> {
            Postulacion guardada = invocacion.getArgument(0);
            guardada.setId(50L);
            return guardada;
        });

        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content("""
                {"voluntariadoId":1,"usuarioId":999,"estado":"APROBADO",
                 "disponibilidad":"Tarde","comentario":"Puedo colaborar"}
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(50))
                .andExpect(jsonPath("$.data.usuarioId").value(10))
                .andExpect(jsonPath("$.data.usuarioNombre").value("Lucía"))
                .andExpect(jsonPath("$.data.voluntariadoId").value(1))
                .andExpect(jsonPath("$.data.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.data.disponibilidad").value("Tarde"))
                .andExpect(jsonPath("$.data.comentario").value("Puedo colaborar"))
                .andExpect(jsonPath("$.data.usuario.password").doesNotExist());

        verify(perfilRepository).findByUsuarioId(10L);
        verify(perfilRepository, never()).findByUsuarioId(999L);
    }

    @Test
    void postSinSesionDevuelve401SinAccederADatos() throws Exception {
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(usuarioRepository, perfilRepository, voluntariadoRepository, postulacionRepository);
    }

    @Test
    void postConJwtExpiradoDevuelve401SinInsertar() throws Exception {
        mvc.perform(post("/api/postulaciones").header("Authorization", "Bearer expirado")
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isUnauthorized());
        verify(jwtService).esValido("expirado");
        verifyNoInteractions(usuarioRepository, perfilRepository, voluntariadoRepository, postulacionRepository);
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void usuarioDeSesionInexistenteRecibe401() throws Exception {
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
        verifyNoInteractions(perfilRepository, voluntariadoRepository, postulacionRepository);
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void usuarioInactivoRecibe401() throws Exception {
        prepararUsuario("USER").setActivo(false);
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(perfilRepository, voluntariadoRepository, postulacionRepository);
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void usuarioSinPerfilRecibe403() throws Exception {
        prepararUsuario("USER");
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Debes registrar un perfil de voluntario antes de postularte"));
        verifyNoInteractions(voluntariadoRepository, postulacionRepository);
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void oportunidadInexistenteRecibe404() throws Exception {
        prepararSolicitudValida();
        when(voluntariadoRepository.findById(1L)).thenReturn(Optional.empty());
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isNotFound());
        verify(postulacionRepository, never()).saveAndFlush(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"BORRADOR", "FINALIZADO", "publicado", "PUBLICADO "})
    @WithMockUser(username = EMAIL, authorities = "USER")
    void oportunidadNoPublicadaRecibe400(String estado) throws Exception {
        prepararSolicitudValida().setEstado(estado);
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La oportunidad no está publicada"));
        verify(postulacionRepository, never()).saveAndFlush(any());
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void oportunidadFinalizadaRecibe400() throws Exception {
        prepararSolicitudValida().setFechaFin(LocalDateTime.of(2000, 1, 1, 16, 0));
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La oportunidad ya finalizó"));
        verify(postulacionRepository, never()).saveAndFlush(any());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n"})
    @WithMockUser(username = EMAIL, authorities = "USER")
    void disponibilidadNulaOVaciaRecibe422(String disponibilidad) throws Exception {
        PostulacionDTO solicitud = new PostulacionDTO();
        solicitud.setVoluntariadoId(1L);
        solicitud.setDisponibilidad(disponibilidad);
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON)
                        .content(new tools.jackson.databind.ObjectMapper().writeValueAsString(solicitud)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.data.disponibilidad").exists());
        verifyNoInteractions(usuarioRepository, perfilRepository, voluntariadoRepository, postulacionRepository);
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void disponibilidadMayorA255Recibe422() throws Exception {
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"voluntariadoId\":1,\"disponibilidad\":\"" + "a".repeat(256) + "\"}"))
                .andExpect(status().isUnprocessableContent());
        verifyNoInteractions(usuarioRepository, perfilRepository, voluntariadoRepository, postulacionRepository);
    }

    @ParameterizedTest
    @ValueSource(strings = {"PENDIENTE", "APROBADO", "RECHAZADO"})
    @WithMockUser(username = EMAIL, authorities = "USER")
    void duplicadoEnCualquierEstadoRecibe409SinModificarElRegistroAnterior(String estado) throws Exception {
        Voluntariado oportunidad = prepararSolicitudValida();
        Postulacion anterior = new Postulacion();
        anterior.setId(20L);
        anterior.setEstado(estado);
        anterior.setVoluntariado(oportunidad);
        when(postulacionRepository.existsByVoluntariadoIdAndUsuarioId(1L, 10L)).thenReturn(true);
        when(postulacionRepository.findByUsuarioId(10L)).thenReturn(List.of(anterior));

        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El usuario ya se postuló a este voluntariado"));
        mvc.perform(get("/api/postulaciones/mias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].estado").value(estado));
        verify(postulacionRepository, never()).saveAndFlush(any());
        verify(postulacionRepository, never()).save(any());
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void colisionDeUniqueDevuelve409ControladoSinDetallesSql() throws Exception {
        prepararSolicitudValida();
        var causa = new org.hibernate.exception.ConstraintViolationException(
                "Duplicate entry", new SQLException("Detalle SQL privado", "23000", 1062),
                "uk_postulacion_usuario_voluntariado");
        when(postulacionRepository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("Conflicto", causa));
        mvc.perform(post("/api/postulaciones").contentType(MediaType.APPLICATION_JSON).content(SOLICITUD))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El usuario ya se postuló a este voluntariado"))
                .andExpect(content().string(not(containsString("Detalle SQL privado"))));
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void usuarioNormalNoPuedeConsultarPostulacionesDeOtroUsuario() throws Exception {
        mvc.perform(get("/api/postulaciones/usuario/999")).andExpect(status().isForbidden());
        verifyNoInteractions(postulacionRepository);
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "ADMIN")
    void administradorConservaConsultaPorUsuario() throws Exception {
        when(postulacionRepository.findByUsuarioId(999L)).thenReturn(List.of());
        mvc.perform(get("/api/postulaciones/usuario/999")).andExpect(status().isOk());
        verify(postulacionRepository).findByUsuarioId(999L);
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void responsableConservaConsultaPorOportunidadYCambioDeEstado() throws Exception {
        Voluntariado oportunidad = prepararSolicitudValida();
        Postulacion postulacion = new Postulacion();
        postulacion.setVoluntariado(oportunidad);
        when(postulacionRepository.findByVoluntariadoId(1L)).thenReturn(List.of(postulacion));
        when(postulacionRepository.findById(20L)).thenReturn(Optional.of(postulacion));
        when(postulacionRepository.save(postulacion)).thenReturn(postulacion);
        mvc.perform(get("/api/postulaciones/voluntariado/1"))
                .andExpect(status().isOk());
        mvc.perform(patch("/api/postulaciones/20/estado").param("estado", "APROBADO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estado").value("APROBADO"));
    }

    @Test
    @WithMockUser(username = EMAIL, authorities = "USER")
    void usuarioAjenoNoPuedeConsultarNiCambiarPostulacionesDeOtraOportunidad() throws Exception {
        Voluntariado oportunidad = prepararSolicitudValida();
        Usuario responsable = new Usuario();
        responsable.setId(999L);
        oportunidad.getCentro().setResponsable(responsable);
        Postulacion postulacion = new Postulacion();
        postulacion.setVoluntariado(oportunidad);
        when(postulacionRepository.findById(20L)).thenReturn(Optional.of(postulacion));
        mvc.perform(get("/api/postulaciones/voluntariado/1")).andExpect(status().isForbidden());
        mvc.perform(patch("/api/postulaciones/20/estado").param("estado", "RECHAZADO"))
                .andExpect(status().isForbidden());
        verify(postulacionRepository, never()).save(any());
    }
}

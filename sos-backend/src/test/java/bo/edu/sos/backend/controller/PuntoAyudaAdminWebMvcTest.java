package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.config.SecurityConfig;
import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.NecesidadRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.security.JwtAuthenticationFilter;
import bo.edu.sos.backend.security.JwtService;
import bo.edu.sos.backend.service.PuntoAyudaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.hamcrest.Matchers.nullValue;

/** API y seguridad reales, con la base de datos simulada. */
@WebMvcTest(PuntoAyudaController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, PuntoAyudaService.class})
class PuntoAyudaAdminWebMvcTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private PuntoAyudaRepository puntoAyudaRepository;
    @MockitoBean
    private DepartamentoRepository departamentoRepository;
    @MockitoBean
    private NecesidadRepository necesidadRepository;
    @MockitoBean
    private UsuarioRepository usuarioRepository;
    @MockitoBean
    private JwtService jwtService;

    @ParameterizedTest
    @ValueSource(strings = {EstadoVerificacion.VERIFICADO, EstadoVerificacion.RECHAZADO})
    @WithMockUser(authorities = Roles.ADMIN)
    void administradorDecideYPersisteMotivoOpcional(String estado) throws Exception {
        PuntoAyuda punto = punto(5L, "Punto solidario", EstadoVerificacion.PENDIENTE);
        Usuario revisor = new Usuario();
        revisor.setId(8L);
        when(puntoAyudaRepository.bloquearParaRevision(5L)).thenReturn(Optional.of(punto));
        when(usuarioRepository.findByEmail("user")).thenReturn(Optional.of(revisor));
        when(puntoAyudaRepository.save(punto)).thenReturn(punto);

        mvc.perform(patch("/api/puntos-ayuda/5/estado").param("estado", estado)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"  Revisado  \"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estadoVerificacion").value(estado))
                .andExpect(jsonPath("$.data.motivoRevision").value("Revisado"))
                .andExpect(jsonPath("$.data.revisorId").value(8));
        verify(puntoAyudaRepository).save(punto);
    }

    @Test
    @WithMockUser(authorities = Roles.ADMIN)
    void rechazoSinMotivoPermaneceNulo() throws Exception {
        PuntoAyuda punto = punto(5L, "Punto solidario", EstadoVerificacion.PENDIENTE);
        when(puntoAyudaRepository.bloquearParaRevision(5L)).thenReturn(Optional.of(punto));
        when(usuarioRepository.findByEmail("user")).thenReturn(Optional.of(new Usuario()));
        when(puntoAyudaRepository.save(punto)).thenReturn(punto);
        mvc.perform(patch("/api/puntos-ayuda/5/estado").param("estado", EstadoVerificacion.RECHAZADO))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.motivoRevision").value(nullValue()));
    }

    @Test
    void decisionSinSesionDevuelve401() throws Exception {
        mvc.perform(patch("/api/puntos-ayuda/5/estado").param("estado", EstadoVerificacion.VERIFICADO))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(puntoAyudaRepository);
    }

    @Test
    @WithMockUser(authorities = Roles.USER)
    void ciudadanoNoPuedeDecidirAunqueManipuleLaPeticion() throws Exception {
        mvc.perform(patch("/api/puntos-ayuda/5/estado").param("estado", EstadoVerificacion.VERIFICADO))
                .andExpect(status().isForbidden());
        verifyNoInteractions(puntoAyudaRepository);
    }

    @Test
    @WithMockUser(authorities = Roles.ADMIN)
    void decisionInvalidaConflictoYNoEncontradoDevuelvenErroresCorrectos() throws Exception {
        mvc.perform(patch("/api/puntos-ayuda/5/estado").param("estado", EstadoVerificacion.PENDIENTE))
                .andExpect(status().isBadRequest());
        mvc.perform(patch("/api/puntos-ayuda/5/estado").param("estado", EstadoVerificacion.RECHAZADO)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"" + "x".repeat(501) + "\"}"))
                .andExpect(status().isUnprocessableContent());
        mvc.perform(patch("/api/puntos-ayuda/5/estado").param("estado", EstadoVerificacion.VERIFICADO))
                .andExpect(status().isNotFound());
        when(puntoAyudaRepository.bloquearParaRevision(5L)).thenReturn(Optional.of(
                punto(5L, "Revisado", EstadoVerificacion.VERIFICADO)));
        mvc.perform(patch("/api/puntos-ayuda/5/estado").param("estado", EstadoVerificacion.RECHAZADO))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.success").value(false));
        verify(puntoAyudaRepository, never()).save(any());
    }

    @Test
    @WithMockUser(authorities = Roles.ADMIN)
    void administradorVePuntosPendientesPorDefecto() throws Exception {
        PuntoAyuda pendiente = punto(5L, "Punto solidario", EstadoVerificacion.PENDIENTE);
        when(puntoAyudaRepository.buscarParaRevision("PENDIENTE", null, null, null))
                .thenReturn(List.of(pendiente));

        mvc.perform(get("/api/puntos-ayuda/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(5))
                .andExpect(jsonPath("$.data[0].estadoVerificacion").value("PENDIENTE"));
    }

    @Test
    @WithMockUser(authorities = Roles.ADMIN)
    void administradorPuedeConsultarDetallePendienteConContactoSinCambiarEstado() throws Exception {
        PuntoAyuda pendiente = punto(5L, "Punto solidario", EstadoVerificacion.PENDIENTE);
        pendiente.setDescripcion("Recepción de alimentos");
        pendiente.setNombreContacto("Persona responsable");
        pendiente.setTelefonoContacto("70700001");
        pendiente.setCorreoContacto("contacto@example.com");
        when(puntoAyudaRepository.findById(5L)).thenReturn(Optional.of(pendiente));

        mvc.perform(get("/api/puntos-ayuda/admin/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.descripcion").value("Recepción de alimentos"))
                .andExpect(jsonPath("$.data.nombreContacto").value("Persona responsable"))
                .andExpect(jsonPath("$.data.telefonoContacto").value("70700001"))
                .andExpect(jsonPath("$.data.correoContacto").value("contacto@example.com"))
                .andExpect(jsonPath("$.data.estadoVerificacion").value("PENDIENTE"));
        verify(puntoAyudaRepository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/puntos-ayuda/admin", "/api/puntos-ayuda/admin/5"})
    void consultasAdministrativasSinSesionDevuelven401(String ruta) throws Exception {
        mvc.perform(get(ruta)).andExpect(status().isUnauthorized());
        verifyNoInteractions(puntoAyudaRepository);
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/puntos-ayuda/admin", "/api/puntos-ayuda/admin/5"})
    @WithMockUser(authorities = Roles.USER)
    void ciudadanoNoPuedeConsultarDatosAdministrativos(String ruta) throws Exception {
        mvc.perform(get(ruta)).andExpect(status().isForbidden());
        verifyNoInteractions(puntoAyudaRepository);
    }

    @Test
    @WithMockUser(authorities = Roles.ADMIN)
    void detalleAdministrativoInexistenteDevuelve404() throws Exception {
        mvc.perform(get("/api/puntos-ayuda/admin/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void detallePublicoSigueOcultandoPendientes() throws Exception {
        when(puntoAyudaRepository.findById(5L))
                .thenReturn(Optional.of(punto(5L, "Punto pendiente", EstadoVerificacion.PENDIENTE)));
        mvc.perform(get("/api/puntos-ayuda/5"))
                .andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @CsvSource({"estado,INVENTADO", "tipo,INVENTADO", "departamentoId,0", "departamentoId,-1", "departamentoId,texto"})
    @WithMockUser(authorities = Roles.ADMIN)
    void filtrosInvalidosDevuelven400(String parametro, String valor) throws Exception {
        mvc.perform(get("/api/puntos-ayuda/admin").param(parametro, valor))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
        verifyNoInteractions(puntoAyudaRepository);
    }

    @ParameterizedTest
    @ValueSource(strings = {"PENDIENTE", "EN_REVISION", "VERIFICADO", "RECHAZADO"})
    @WithMockUser(authorities = Roles.ADMIN)
    void permiteFiltrarPorCadaEstadoDeVerificacion(String estado) throws Exception {
        when(puntoAyudaRepository.buscarParaRevision(estado, null, null, null))
                .thenReturn(List.of(punto(5L, "Punto filtrado", estado)));
        mvc.perform(get("/api/puntos-ayuda/admin").param("estado", estado))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].estadoVerificacion").value(estado));
    }

    @Test
    @WithMockUser(authorities = Roles.ADMIN)
    void combinaFiltrosYNormalizaLaBusquedaComoTextoLiteral() throws Exception {
        when(puntoAyudaRepository.buscarParaRevision("PENDIENTE", "EMERGENCIA", 3L, "%villa !%!_%"))
                .thenReturn(List.of(punto(9L, "Ayuda Villa %_", "PENDIENTE")));
        mvc.perform(get("/api/puntos-ayuda/admin")
                        .param("tipo", "EMERGENCIA").param("departamentoId", "3")
                        .param("buscar", "  VILLA %_  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(9));
    }

    @Test
    @WithMockUser(authorities = Roles.ADMIN)
    void busquedaDemasiadoLargaDevuelve400() throws Exception {
        mvc.perform(get("/api/puntos-ayuda/admin").param("buscar", "a".repeat(151)))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(puntoAyudaRepository);
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/puntos-ayuda", "/api/puntos-ayuda/5", "/api/puntos-ayuda/departamento/3"})
    void consultasPublicasNoExponenContactoNiCreador(String ruta) throws Exception {
        PuntoAyuda verificado = punto(5L, "Punto público", EstadoVerificacion.VERIFICADO);
        verificado.setNombreContacto("Contacto privado de prueba");
        verificado.setTelefonoContacto("70700001");
        verificado.setCorreoContacto("privado@example.com");
        verificado.setMotivoRevision("Nota interna de aprobación");
        var revisor = new bo.edu.sos.backend.entity.Usuario();
        revisor.setId(99L);
        verificado.setRevisor(revisor);
        var creador = new bo.edu.sos.backend.entity.Usuario();
        creador.setId(10L);
        verificado.setCreador(creador);
        String datos;
        if (ruta.endsWith("/5")) {
            when(puntoAyudaRepository.findById(5L)).thenReturn(Optional.of(verificado));
            datos = "$.data";
        } else if (ruta.contains("/departamento/")) {
            when(puntoAyudaRepository.findByDepartamentoId(3L)).thenReturn(List.of(
                    verificado, punto(6L, "Pendiente privado", EstadoVerificacion.PENDIENTE)));
            datos = "$.data[0]";
        } else {
            when(puntoAyudaRepository.findByEstadoVerificacion("VERIFICADO"))
                    .thenReturn(List.of(verificado));
            datos = "$.data[0]";
        }
        var respuesta = mvc.perform(get(ruta)).andExpect(status().isOk())
                .andExpect(jsonPath(datos + ".id").value(5))
                .andExpect(jsonPath(datos + ".nombreContacto").value(nullValue()))
                .andExpect(jsonPath(datos + ".telefonoContacto").value(nullValue()))
                .andExpect(jsonPath(datos + ".correoContacto").value(nullValue()))
                .andExpect(jsonPath(datos + ".creadorId").value(nullValue()))
                .andExpect(jsonPath(datos + ".motivoRevision").value(nullValue()))
                .andExpect(jsonPath(datos + ".revisorId").value(nullValue()));
        if (!ruta.endsWith("/5")) respuesta.andExpect(jsonPath("$.data.length()").value(1));
    }

    private PuntoAyuda punto(Long id, String nombre, String estado) {
        PuntoAyuda punto = new PuntoAyuda();
        punto.setId(id);
        punto.setNombre(nombre);
        punto.setTipo("PUNTO_DONACION");
        punto.setEstadoVerificacion(estado);
        return punto;
    }
}

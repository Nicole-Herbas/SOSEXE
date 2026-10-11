package bo.edu.sos.backend.config;

import bo.edu.sos.backend.constants.ApiRoutes;
import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.dto.PuntoAyudaDTO;
import bo.edu.sos.backend.dto.RegistrarPuntoAyudaDTO;
import bo.edu.sos.backend.service.PuntoAyudaService;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc
class PuntoAyudaSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PuntoAyudaService puntoAyudaService;


    @Test
    void registrarSinAutenticacionDebeRetornar401() throws Exception {

        mockMvc.perform(
                post(ApiRoutes.PUNTOS_AYUDA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
        ).andExpect(status().isUnauthorized());

        verifyNoInteractions(puntoAyudaService);
    }


    @Test
    void listarMisPuntosSinAutenticacionDebeRetornar401() throws Exception {

        mockMvc.perform(
                get(ApiRoutes.PUNTOS_AYUDA + "/mios")
        ).andExpect(status().isUnauthorized());

        verifyNoInteractions(puntoAyudaService);
    }


    @Test
    void listarTodosSinAutenticacionDebeRetornar200() throws Exception {

        when(puntoAyudaService.listarTodos())
                .thenReturn(List.of());

        mockMvc.perform(
                get(ApiRoutes.PUNTOS_AYUDA)
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(puntoAyudaService).listarTodos();
    }


    @Test
    void buscarPorIdSinAutenticacionDebeRetornar200() throws Exception {

        PuntoAyudaDTO punto = new PuntoAyudaDTO();
        punto.setId(5L);
        punto.setNombre("Punto verificado");
        punto.setEstadoVerificacion(EstadoVerificacion.VERIFICADO);

        when(puntoAyudaService.buscarPorId(5L))
                .thenReturn(punto);

        mockMvc.perform(
                get(ApiRoutes.PUNTOS_AYUDA + "/5")
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nombre").value("Punto verificado"));
    }


    @Test
    @WithMockUser(username = "usuario@ejemplo.com", authorities = Roles.USER)
    void listarMisPuntosDebeUsarUsuarioAutenticado() throws Exception {

        PuntoAyudaDTO punto = new PuntoAyudaDTO();
        punto.setId(5L);
        punto.setNombre("Mi punto");
        punto.setEstadoVerificacion(EstadoVerificacion.PENDIENTE);

        when(puntoAyudaService.listarMisPuntos("usuario@ejemplo.com"))
                .thenReturn(List.of(punto));

        mockMvc.perform(
                get(ApiRoutes.PUNTOS_AYUDA + "/mios")
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].estadoVerificacion")
                        .value(EstadoVerificacion.PENDIENTE));

        verify(puntoAyudaService).listarMisPuntos("usuario@ejemplo.com");
    }


    @Test
    @WithMockUser(username = "usuario@ejemplo.com", authorities = Roles.USER)
    void registrarDatosInvalidosDebeRetornar422() throws Exception {

        mockMvc.perform(
                post(ApiRoutes.PUNTOS_AYUDA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
        )
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.nombre").exists());

        verifyNoInteractions(puntoAyudaService);
    }


    @Test
    @WithMockUser(username = "usuario@ejemplo.com", authorities = Roles.USER)
    void registrarRefugioDebeRetornar422() throws Exception {

        String solicitud = solicitudValida("REFUGIO");

        mockMvc.perform(
                post(ApiRoutes.PUNTOS_AYUDA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitud)
        )
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.data.tipo").exists());

        verifyNoInteractions(puntoAyudaService);
    }


    @Test
    @WithMockUser(username = "usuario@ejemplo.com", authorities = Roles.USER)
    void registrarCentroDebeRetornar422() throws Exception {

        mockMvc.perform(
                post(ApiRoutes.PUNTOS_AYUDA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitudValida("CENTRO_APOYO"))
        )
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.data.tipo").exists());

        verifyNoInteractions(puntoAyudaService);
    }




    @Test
    @WithMockUser(username = "usuario@ejemplo.com", authorities = Roles.USER)
    void usuarioAutenticadoDebeRegistrarPuntoCon201() throws Exception {

        PuntoAyudaDTO creado = new PuntoAyudaDTO();
        creado.setId(8L);
        creado.setNombre("Punto solidario");
        creado.setEstadoVerificacion(EstadoVerificacion.PENDIENTE);

        when(puntoAyudaService.registrarComoCiudadano(
                any(RegistrarPuntoAyudaDTO.class),
                eq("usuario@ejemplo.com")
        )).thenReturn(creado);

        mockMvc.perform(
                post(ApiRoutes.PUNTOS_AYUDA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitudValida("PUNTO_DONACION"))
        )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(8))
                .andExpect(jsonPath("$.data.estadoVerificacion")
                        .value(EstadoVerificacion.PENDIENTE));

        verify(puntoAyudaService).registrarComoCiudadano(
                any(RegistrarPuntoAyudaDTO.class),
                eq("usuario@ejemplo.com")
        );
    }

    @Test
    @WithMockUser(username = "usuario@ejemplo.com", authorities = Roles.USER)
    void usuarioNormalNoDebeModificarPunto() throws Exception {

        mockMvc.perform(
                delete(ApiRoutes.PUNTOS_AYUDA + "/5")
        ).andExpect(status().isForbidden());

        verifyNoInteractions(puntoAyudaService);
    }


    private String solicitudValida(String tipo) {

        return """
                {
                  "nombre": "Punto solidario",
                  "tipo": "%s",
                  "descripcion": "Entrega de insumos",
                  "direccion": "Av. América",
                  "ciudad": "Cochabamba",
                  "departamentoId": 3,
                  "latitud": -17.3895,
                  "longitud": -66.1568,
                  "necesidadIds": [1],
                  "nombreContacto": "Responsable",
                  "telefonoContacto": "70700001",
                  "correoContacto": "contacto@ejemplo.com"
                }
                """.formatted(tipo);
    }
}

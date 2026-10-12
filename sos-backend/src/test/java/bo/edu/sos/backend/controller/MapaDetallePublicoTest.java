package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;
import bo.edu.sos.backend.service.MapaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MapaDetallePublicoTest {

    private CentroRepository centros;
    private PuntoAyudaRepository puntos;
    private MapaService service;
    private MockMvc mvc;

    @BeforeEach
    void configurarSinBaseDeDatos() {
        centros = mock(CentroRepository.class);
        puntos = mock(PuntoAyudaRepository.class);
        service = new MapaService(centros, puntos);
        mvc = MockMvcBuilders.standaloneSetup(new MapaController(service)).build();
    }

    @Test
    void mapaNoExponeContactoDeRegistroEnListadoNiDetalle() throws Exception {
        PuntoAyuda punto = new PuntoAyuda();
        punto.setId(7L);
        punto.setNombre("Punto verificado");
        punto.setEstadoVerificacion("VERIFICADO");
        punto.setNombreContacto("Contacto privado");
        punto.setTelefonoContacto("79999999");
        punto.setCorreoContacto("privado@example.org");
        when(centros.findAll()).thenReturn(List.of());
        when(puntos.findAll()).thenReturn(List.of(punto));
        when(puntos.findById(7L)).thenReturn(Optional.of(punto));

        for (String url : List.of("/api/mapa/puntos", "/api/mapa/puntos/PUNTO_AYUDA/7")) {
            String ruta = url.endsWith("/7") ? "$.data" : "$.data[0]";
            mvc.perform(get(url))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath(ruta + ".nombreContacto").doesNotExist())
                    .andExpect(jsonPath(ruta + ".telefonoContacto").doesNotExist())
                    .andExpect(jsonPath(ruta + ".correoContacto").doesNotExist())
                    .andExpect(jsonPath(ruta + ".telefono").doesNotExist())
                    .andExpect(jsonPath(ruta + ".email").doesNotExist())
                    .andExpect(content().string(org.hamcrest.Matchers.not(
                            org.hamcrest.Matchers.containsString("Contacto privado"))))
                    .andExpect(content().string(org.hamcrest.Matchers.not(
                            org.hamcrest.Matchers.containsString("79999999"))))
                    .andExpect(content().string(org.hamcrest.Matchers.not(
                            org.hamcrest.Matchers.containsString("privado@example.org"))));
        }
    }

    @Test
    void detalleConservaElContactoPublicoDelCentro() throws Exception {
        Centro centro = new Centro();
        centro.setId(1L);
        centro.setTelefono("71234567");
        centro.setEmail("centro@example.org");
        when(centros.findById(1L)).thenReturn(Optional.of(centro));

        mvc.perform(get("/api/mapa/puntos/CENTRO/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.telefono").value("71234567"))
                .andExpect(jsonPath("$.data.email").value("centro@example.org"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"PENDIENTE", "RECHAZADO"})
    void mapaNoAmpliaVisibilidadDePuntosDeAyudaNoVerificados(String estado) {
        PuntoAyuda punto = new PuntoAyuda();
        punto.setId(7L);
        punto.setEstadoVerificacion(estado);
        when(centros.findAll()).thenReturn(List.of());
        when(puntos.findAll()).thenReturn(List.of(punto));
        when(puntos.findById(7L)).thenReturn(Optional.of(punto));

        assertTrue(service.listarPuntosMapa().isEmpty());
        assertThrows(ResourceNotFoundException.class, () -> service.buscarDetalle("PUNTO_AYUDA", 7L));
    }
}

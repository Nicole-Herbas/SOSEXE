
package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.PuntoAyudaDTO;
import bo.edu.sos.backend.dto.RegistrarPuntoAyudaDTO;
import bo.edu.sos.backend.service.PuntoAyudaService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class PuntoAyudaControllerTest {

    @Mock
    private PuntoAyudaService puntoAyudaService;

    @Mock
    private Authentication authentication;


    private PuntoAyudaController puntoAyudaController;


    @BeforeEach
    void setUp() {

        puntoAyudaController =
                new PuntoAyudaController(
                        puntoAyudaService
                );
    }


    // ==========================================
    // REGISTRO CIUDADANO
    // ==========================================

    @Test
    void crearDebeUsarUsuarioAutenticado() {

        RegistrarPuntoAyudaDTO solicitud =
                new RegistrarPuntoAyudaDTO();

        solicitud.setNombre("Punto Solidario");
        solicitud.setTipo("PUNTO_DONACION");
        solicitud.setDescripcion("Recepción de donaciones");
        solicitud.setDireccion("Av. América");
        solicitud.setCiudad("Cochabamba");
        solicitud.setDepartamentoId(3L);

        solicitud.setLatitud(
                new BigDecimal("-17.3895000")
        );

        solicitud.setLongitud(
                new BigDecimal("-66.1568000")
        );

        solicitud.setNecesidadIds(
                List.of(1L)
        );

        solicitud.setNombreContacto("Responsable");
        solicitud.setTelefonoContacto("70700001");


        PuntoAyudaDTO creado =
                new PuntoAyudaDTO();

        creado.setId(5L);
        creado.setNombre("Punto Solidario");
        creado.setEstadoVerificacion(
                EstadoVerificacion.PENDIENTE
        );


        when(authentication.getName())
                .thenReturn("usuario@ejemplo.com");

        when(puntoAyudaService.registrarComoCiudadano(
                solicitud,
                "usuario@ejemplo.com"
        )).thenReturn(creado);


        ResponseEntity<ApiResponse<PuntoAyudaDTO>> respuesta =
                puntoAyudaController.crear(
                        solicitud,
                        authentication
                );


        assertEquals(
                201,
                respuesta.getStatusCode().value()
        );

        assertNotNull(
                respuesta.getBody()
        );

        PuntoAyudaDTO resultado =
                respuesta.getBody().getData();

        assertEquals(5L, resultado.getId());

        assertEquals(
                EstadoVerificacion.PENDIENTE,
                resultado.getEstadoVerificacion()
        );

        verify(puntoAyudaService)
                .registrarComoCiudadano(
                        solicitud,
                        "usuario@ejemplo.com"
                );
    }


    // ==========================================
    // PUNTOS DEL USUARIO
    // ==========================================

    @Test
    void listarMiosDebeConsultarSoloAlUsuarioAutenticado() {

        PuntoAyudaDTO punto =
                new PuntoAyudaDTO();

        punto.setId(5L);
        punto.setNombre("Mi punto");
        punto.setEstadoVerificacion(
                EstadoVerificacion.PENDIENTE
        );


        when(authentication.getName())
                .thenReturn("usuario@ejemplo.com");

        when(puntoAyudaService.listarMisPuntos(
                "usuario@ejemplo.com"
        )).thenReturn(
                List.of(punto)
        );


        ResponseEntity<ApiResponse<List<PuntoAyudaDTO>>> respuesta =
                puntoAyudaController.listarMios(
                        authentication
                );


        assertEquals(
                200,
                respuesta.getStatusCode().value()
        );

        assertNotNull(
                respuesta.getBody()
        );

        List<PuntoAyudaDTO> resultado =
                respuesta.getBody().getData();

        assertEquals(1, resultado.size());

        assertEquals(
                "Mi punto",
                resultado.get(0).getNombre()
        );

        assertEquals(
                EstadoVerificacion.PENDIENTE,
                resultado.get(0).getEstadoVerificacion()
        );

        verify(puntoAyudaService)
                .listarMisPuntos(
                        "usuario@ejemplo.com"
                );
    }


    // ==========================================
    // CONSULTAS PÚBLICAS
    // ==========================================

    @Test
    void listarPublicosDebeRetornarRespuestaCorrecta() {

        PuntoAyudaDTO punto =
                new PuntoAyudaDTO();

        punto.setId(2L);
        punto.setNombre("Punto verificado");
        punto.setEstadoVerificacion(
                EstadoVerificacion.VERIFICADO
        );


        when(puntoAyudaService.listarPublicos())
                .thenReturn(
                        List.of(punto)
                );


        ResponseEntity<ApiResponse<List<PuntoAyudaDTO>>> respuesta =
                puntoAyudaController.listarPublicos();


        assertEquals(
                200,
                respuesta.getStatusCode().value()
        );

        assertNotNull(
                respuesta.getBody()
        );

        assertTrue(
                respuesta.getBody().isSuccess()
        );

        assertEquals(
                1,
                respuesta.getBody().getData().size()
        );

        verify(puntoAyudaService)
                .listarPublicos();
    }
}

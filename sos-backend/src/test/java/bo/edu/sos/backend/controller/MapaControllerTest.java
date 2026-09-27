package bo.edu.sos.backend.controller;

import bo.edu.sos.backend.dto.ApiResponse;
import bo.edu.sos.backend.dto.PuntoMapaDTO;
import bo.edu.sos.backend.service.MapaService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class MapaControllerTest {

    @Mock
    private MapaService mapaService;

    private MapaController mapaController;


    @BeforeEach
    void setUp() {
        mapaController = new MapaController(mapaService);
    }


    @Test
    void listarPuntosDebeRetornarApiResponseConListaUnificada() {

        PuntoMapaDTO punto = new PuntoMapaDTO();
        punto.setId(1L);
        punto.setOrigen("CENTRO");
        punto.setNombre("Centro San José");
        punto.setTipo("CENTRO_APOYO");
        punto.setCiudad("Cochabamba");
        punto.setDepartamentoNombre("Cochabamba");
        punto.setLatitud(new BigDecimal("-17.3895000"));
        punto.setLongitud(new BigDecimal("-66.1568000"));
        punto.setEstadoVerificacion("VERIFICADO");
        punto.setNecesidades(List.of("Agua", "Alimentos"));

        when(mapaService.listarPuntosMapa())
                .thenReturn(List.of(punto));


        ResponseEntity<ApiResponse<List<PuntoMapaDTO>>> respuesta =
                mapaController.listarPuntos();


        assertEquals(200, respuesta.getStatusCode().value());

        ApiResponse<List<PuntoMapaDTO>> body = respuesta.getBody();
        assertNotNull(body);
        assertTrue(body.isSuccess());

        List<PuntoMapaDTO> data = body.getData();
        assertEquals(1, data.size());
        assertEquals("Centro San José", data.get(0).getNombre());
        assertEquals("CENTRO", data.get(0).getOrigen());
        assertEquals("Cochabamba", data.get(0).getDepartamentoNombre());
        assertEquals(List.of("Agua", "Alimentos"), data.get(0).getNecesidades());

        verify(mapaService).listarPuntosMapa();
    }
}

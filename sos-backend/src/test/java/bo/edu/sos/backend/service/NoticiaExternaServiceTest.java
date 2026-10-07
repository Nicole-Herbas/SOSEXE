package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.NoticiaConstants;
import bo.edu.sos.backend.dto.ResultadoNoticiasExternasDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class NoticiaExternaServiceTest {

    private static final String URL_API =
            "https://newsdata.io/api/1/latest?apikey=test-key&q=Bolivia&language=es";
    private static final String RESPUESTA_EXITOSA = """
            {
              "status": "success",
              "results": [{
                "article_id": "articulo-1",
                "title": "Lluvias en Bolivia",
                "description": "Resumen de prueba",
                "link": "https://example.com/noticia",
                "image_url": "https://example.com/imagen.jpg",
                "pubDate": "2026-09-29 12:00:00",
                "source_name": "Medio de prueba",
                "category": ["environment"],
                "country": ["bolivia"]
              }]
            }
            """;

    private MockRestServiceServer servidor;
    private NoticiaExternaService servicio;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        servidor = MockRestServiceServer.bindTo(builder).build();
        servicio = new NoticiaExternaService(builder);
        ReflectionTestUtils.setField(servicio, "apiKey", "test-key");
    }

    @Test
    void obtenerNoticiasDebeMapearRespuestaYMarcarApiDisponible() {
        servidor.expect(requestTo(URL_API))
                .andRespond(withSuccess(RESPUESTA_EXITOSA, MediaType.APPLICATION_JSON));

        ResultadoNoticiasExternasDTO resultado = servicio.obtenerNoticias();

        assertTrue(resultado.apiDisponible());
        assertFalse(resultado.desdeCache());
        assertEquals(1, resultado.noticias().size());
        assertEquals("articulo-1", resultado.noticias().get(0).getId());
        servidor.verify();
    }

    @Test
    void falloSinCacheDebeRetornarListaVaciaYAplicarEnfriamiento() {
        servidor.expect(requestTo(URL_API))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        ResultadoNoticiasExternasDTO primerResultado = servicio.obtenerNoticias();
        ResultadoNoticiasExternasDTO segundoResultado = servicio.obtenerNoticias();

        assertFalse(primerResultado.apiDisponible());
        assertFalse(primerResultado.desdeCache());
        assertTrue(primerResultado.noticias().isEmpty());
        assertFalse(segundoResultado.apiDisponible());
        assertFalse(segundoResultado.desdeCache());
        servidor.verify();
    }

    @Test
    void falloTrasVencerCacheDebeDevolverLosDatosAnterioresComoStale() {
        servidor.expect(requestTo(URL_API))
                .andRespond(withSuccess(RESPUESTA_EXITOSA, MediaType.APPLICATION_JSON));
        servidor.expect(requestTo(URL_API))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));
        ResultadoNoticiasExternasDTO resultadoInicial = servicio.obtenerNoticias();
        assertEquals(1, resultadoInicial.noticias().size());

        ReflectionTestUtils.setField(
                servicio,
                "ultimaActualizacion",
                System.currentTimeMillis() - NoticiaConstants.CACHE_DURACION_MS - 1);
        ResultadoNoticiasExternasDTO resultadoDegradado = servicio.obtenerNoticias();

        assertFalse(resultadoDegradado.apiDisponible());
        assertTrue(resultadoDegradado.desdeCache());
        assertEquals("articulo-1", resultadoDegradado.noticias().get(0).getId());
        servidor.verify();
    }
}
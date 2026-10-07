package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.NoticiaConstants;
import bo.edu.sos.backend.dto.NewsdataRespuestaDTO;
import bo.edu.sos.backend.dto.NewsdataRespuestaDTO.Articulo;
import bo.edu.sos.backend.dto.NoticiaExternaDTO;
import bo.edu.sos.backend.dto.ResultadoNoticiasExternasDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Servicio que obtiene noticias de Bolivia desde la API pública de newsdata.io
 * y las convierte a {@link NoticiaExternaDTO} para el frontend.
 *
 * <p><strong>Caché en memoria:</strong> Para respetar el límite de 200
 * peticiones/día del plan gratuito, los resultados se almacenan en memoria
 * durante {@value NoticiaConstants#CACHE_DURACION_MS} ms (15 minutos).
 * El acceso es hilo-seguro mediante {@code synchronized}.</p>
 */
@Service
public class NoticiaExternaService {

    private static final Logger log = LoggerFactory.getLogger(NoticiaExternaService.class);

    private final RestClient restClient;

    @Value("${newsdata.apikey}")
    private String apiKey;

    // ── Caché en memoria (hilo-seguro) ───────────────────────────────────────
    private volatile List<NoticiaExternaDTO> cache = List.of();
    private volatile long ultimaActualizacion = 0L;
    private volatile boolean consultaRealizada;
    private volatile boolean apiDisponible;

    public NoticiaExternaService(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl(NoticiaConstants.API_EXTERNA_BASE_URL)
                .build();
    }

    /**
     * Retorna las noticias de Bolivia desde newsdata.io.
     * Si el caché está vigente (menos de 15 min desde la última llamada),
     * devuelve los resultados almacenados sin realizar una nueva petición HTTP.
     *
     * @return lista de {@link NoticiaExternaDTO}, nunca {@code null}.
     */
    public synchronized ResultadoNoticiasExternasDTO obtenerNoticias() {

        long ahora = System.currentTimeMillis();

        if (consultaRealizada
                && ahora - ultimaActualizacion < NoticiaConstants.CACHE_DURACION_MS) {
            return new ResultadoNoticiasExternasDTO(
                cache,
                apiDisponible,
                apiDisponible || !cache.isEmpty());
        }

        try {
            NewsdataRespuestaDTO respuesta = restClient.get()
                    .uri(uri -> uri
                            .queryParam("apikey",   apiKey)
                            .queryParam("q",        NoticiaConstants.API_EXTERNA_QUERY)
                            .queryParam("language", NoticiaConstants.API_EXTERNA_LANG)
                            .build())
                    .retrieve()
                    .body(NewsdataRespuestaDTO.class);

            cache = mapearArticulos(respuesta);
            apiDisponible = true;
            consultaRealizada = true;
            ultimaActualizacion = ahora;
            return new ResultadoNoticiasExternasDTO(cache, true, false);
        } catch (RestClientException ex) {
            log.warn(NoticiaConstants.LOG_API_EXTERNA_FALLO, ex.getClass().getSimpleName());
            apiDisponible = false;
            consultaRealizada = true;
            ultimaActualizacion = ahora;
            return new ResultadoNoticiasExternasDTO(cache, false, !cache.isEmpty());
        }
    }

    // ── Métodos privados ─────────────────────────────────────────────────────

    private List<NoticiaExternaDTO> mapearArticulos(NewsdataRespuestaDTO respuesta) {

        if (respuesta == null || respuesta.getResults() == null) {
            return List.of();
        }

        return respuesta.getResults().stream()
                .map(this::mapearArticulo)
                .toList();
    }

    private NoticiaExternaDTO mapearArticulo(Articulo articulo) {

        NoticiaExternaDTO dto = new NoticiaExternaDTO();

        dto.setId(articulo.getArticleId());
        dto.setTitulo(articulo.getTitle());
        dto.setDescripcion(articulo.getDescription());
        dto.setUrl(articulo.getLink());
        dto.setImagenUrl(articulo.getImageUrl());
        dto.setFuente(articulo.getSourceName());
        dto.setFechaPublicacion(articulo.getPubDate());

        // Primer elemento de la lista de categorías (puede ser nulo en API gratuita)
        dto.setCategoria(
                articulo.getCategory() != null && !articulo.getCategory().isEmpty()
                        ? articulo.getCategory().get(0)
                        : "general"
        );

        // Primer elemento de la lista de países
        dto.setPais(
                articulo.getCountry() != null && !articulo.getCountry().isEmpty()
                        ? articulo.getCountry().get(0)
                        : "bolivia"
        );

        return dto;
    }
}

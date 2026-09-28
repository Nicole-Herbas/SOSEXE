package bo.edu.sos.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO interno para deserializar la respuesta JSON de la API newsdata.io.
 *
 * <p>Solo se mapean los campos disponibles en el plan gratuito.
 * Los campos de planes de pago (content, sentiment, ai_tag) se ignoran.</p>
 *
 * <p>No se expone directamente al cliente; se usa únicamente dentro de
 * {@link bo.edu.sos.backend.service.NoticiaExternaService}.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class NewsdataRespuestaDTO {

    private String status;

    private List<Articulo> results;

    @JsonProperty("nextPage")
    private String nextPage;

    // ────────────────────────────────────────────────────────────────────────
    // Clase interna que representa un artículo individual de newsdata.io
    // ────────────────────────────────────────────────────────────────────────
    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Articulo {

        @JsonProperty("article_id")
        private String articleId;

        private String title;

        private String description;

        private String link;

        @JsonProperty("image_url")
        private String imageUrl;

        /** Fecha de publicación: "yyyy-MM-dd HH:mm:ss" UTC. */
        @JsonProperty("pubDate")
        private String pubDate;

        @JsonProperty("source_name")
        private String sourceName;

        /** Lista de categorías (e.g. ["politics", "environment"]). */
        private List<String> category;

        /** Lista de países (e.g. ["bolivia"]). */
        private List<String> country;

        /** Lista de autores. */
        private List<String> creator;
    }
}

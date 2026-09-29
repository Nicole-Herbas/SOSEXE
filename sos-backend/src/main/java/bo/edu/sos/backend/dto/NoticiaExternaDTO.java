package bo.edu.sos.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO normalizado que representa un artículo de noticias proveniente
 * de la API externa newsdata.io.
 *
 * <p>Los nombres de campo siguen la misma convención camelCase del resto
 * de DTOs del proyecto para que el frontend los consuma de forma uniforme.</p>
 */
@Getter
@Setter
@NoArgsConstructor
public class NoticiaExternaDTO {

    /** Identificador único del artículo (article_id de newsdata.io). */
    private String id;

    /** Título del artículo (title). */
    private String titulo;

    /** Resumen o descripción breve (description). */
    private String descripcion;

    /** URL del artículo original en el sitio fuente (link). */
    private String url;

    /** URL de la imagen principal del artículo (image_url). */
    private String imagenUrl;

    /** Nombre del medio de comunicación fuente (source_name). */
    private String fuente;

    /** Categoría normalizada del artículo (primera de la lista category[]). */
    private String categoria;

    /** País de origen del artículo (primer elemento de country[]). */
    private String pais;

    /**
     * Fecha y hora de publicación como cadena ISO
     * (pubDate de newsdata.io: formato "yyyy-MM-dd HH:mm:ss").
     */
    private String fechaPublicacion;

    /**
     * Siempre {@code true} — permite que el frontend unifique noticias
     * propias ({@code esExterna=false}) y externas en la misma lista.
     */
    private boolean esExterna = true;
}

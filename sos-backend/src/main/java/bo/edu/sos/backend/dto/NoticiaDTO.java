package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class NoticiaDTO {

    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 220, message = "El título no puede superar los 220 caracteres")
    private String titulo;

    @NotBlank(message = "El contenido es obligatorio")
    private String contenido;

    @NotBlank(message = "La categoría es obligatoria")
    @Size(max = 60, message = "La categoría no puede superar los 60 caracteres")
    private String categoria;

    @Size(max = 500, message = "La URL de imagen no puede superar los 500 caracteres")
    private String imagenUrl;

    @Size(max = 250, message = "La fuente no puede superar los 250 caracteres")
    private String fuente;

    private LocalDateTime fechaPublicacion;

    private String estado;

    private Long autorId;

    private String autorNombre;
}

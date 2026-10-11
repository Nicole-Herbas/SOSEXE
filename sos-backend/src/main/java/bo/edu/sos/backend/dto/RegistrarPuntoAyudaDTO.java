package bo.edu.sos.backend.dto;

import bo.edu.sos.backend.constants.TiposPuntoAyuda;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RegistrarPuntoAyudaDTO {

    @NotBlank(message = "El nombre del punto es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotBlank(message = "Selecciona el tipo de punto")
    @Pattern(
            regexp = TiposPuntoAyuda.REGEX_CIUDADANO,
            message = "Selecciona un punto de donación, entrega u otro punto de ayuda"
    )
    private String tipo;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 500)
    private String descripcion;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 250)
    private String direccion;

    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 100)
    private String ciudad;

    @NotNull(message = "Selecciona un departamento")
    private Long departamentoId;

    @NotNull(message = "Selecciona una ubicación")
    @DecimalMin(value = "-90.0", message = "Latitud inválida")
    @DecimalMax(value = "90.0", message = "Latitud inválida")
    private BigDecimal latitud;

    @NotNull(message = "Selecciona una ubicación")
    @DecimalMin(value = "-180.0", message = "Longitud inválida")
    @DecimalMax(value = "180.0", message = "Longitud inválida")
    private BigDecimal longitud;

    @NotNull(message = "Selecciona las necesidades")
    @Size(min = 1, message = "Selecciona al menos una necesidad")
    private List<@NotNull Long> necesidadIds;

    @NotBlank(message = "El nombre del contacto es obligatorio")
    @Size(max = 150)
    private String nombreContacto;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(
            regexp = "^\\+?[0-9]{7,15}$",
            message = "El teléfono debe tener entre 7 y 15 dígitos"
    )
    private String telefonoContacto;

    @Email(message = "El correo no tiene un formato válido")
    @Size(max = 150)
    private String correoContacto;
}

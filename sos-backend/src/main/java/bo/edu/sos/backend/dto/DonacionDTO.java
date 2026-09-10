package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class DonacionDTO {

    private Long id;

    private String codigo;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    @NotBlank(message = "El método de pago es obligatorio")
    @Size(max = 30, message = "El método no puede superar los 30 caracteres")
    private String metodo;

    private Boolean anonima;

    private LocalDateTime fecha;

    @NotNull(message = "El centro es obligatorio")
    private Long centroId;

    private Long usuarioId;

    private String centroNombre;
}

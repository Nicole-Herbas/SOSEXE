package bo.edu.sos.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PuntoMapaDTO {

    private Long id;

    private String origen;

    private String nombre;

    private String tipo;

    private String descripcion;

    private String direccion;

    private String ciudad;

    private String departamentoNombre;

    private String telefono;

    private String email;

    private BigDecimal latitud;

    private BigDecimal longitud;

    private String estadoVerificacion;

    private List<String> necesidades;

    private LocalDateTime fechaActualizacion;
}

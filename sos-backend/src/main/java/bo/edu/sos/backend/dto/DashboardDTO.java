package bo.edu.sos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    private long totalCentros;
    private long centrosPendientes;
    private long centrosVerificados;

    private long totalSolicitudesCentro;
    private long solicitudesCentroPendientes;

    private long totalUsuarios;
    private long totalPuntosAyuda;
    private long totalVoluntariados;
    private long totalPostulaciones;
    private long totalDonaciones;
}
package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.dto.DashboardDTO;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.DonacionRepository;
import bo.edu.sos.backend.repository.PostulacionRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;
import bo.edu.sos.backend.repository.SolicitudCentroRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private CentroRepository centroRepository;

    @Mock
    private SolicitudCentroRepository solicitudCentroRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PuntoAyudaRepository puntoAyudaRepository;

    @Mock
    private VoluntariadoRepository voluntariadoRepository;

    @Mock
    private PostulacionRepository postulacionRepository;

    @Mock
    private DonacionRepository donacionRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void obtenerResumen_devuelveLosConteosDeCadaRepositorio() {

        when(centroRepository.count()).thenReturn(5L);
        when(centroRepository.countByEstadoVerificacion(
                EstadoVerificacion.PENDIENTE)).thenReturn(2L);
        when(centroRepository.countByEstadoVerificacion(
                EstadoVerificacion.VERIFICADO)).thenReturn(3L);

        when(solicitudCentroRepository.count()).thenReturn(4L);
        when(solicitudCentroRepository.countByEstado(
                EstadoVerificacion.PENDIENTE)).thenReturn(1L);

        when(usuarioRepository.count()).thenReturn(10L);
        when(puntoAyudaRepository.count()).thenReturn(6L);
        when(voluntariadoRepository.count()).thenReturn(3L);
        when(postulacionRepository.count()).thenReturn(7L);
        when(donacionRepository.count()).thenReturn(8L);

        DashboardDTO resultado = dashboardService.obtenerResumen();

        assertEquals(5L, resultado.getTotalCentros());
        assertEquals(2L, resultado.getCentrosPendientes());
        assertEquals(3L, resultado.getCentrosVerificados());
        assertEquals(4L, resultado.getTotalSolicitudesCentro());
        assertEquals(1L, resultado.getSolicitudesCentroPendientes());
        assertEquals(10L, resultado.getTotalUsuarios());
        assertEquals(6L, resultado.getTotalPuntosAyuda());
        assertEquals(3L, resultado.getTotalVoluntariados());
        assertEquals(7L, resultado.getTotalPostulaciones());
        assertEquals(8L, resultado.getTotalDonaciones());
    }
}
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final CentroRepository centroRepository;
    private final SolicitudCentroRepository solicitudCentroRepository;
    private final UsuarioRepository usuarioRepository;
    private final PuntoAyudaRepository puntoAyudaRepository;
    private final VoluntariadoRepository voluntariadoRepository;
    private final PostulacionRepository postulacionRepository;
    private final DonacionRepository donacionRepository;

    public DashboardService(
            CentroRepository centroRepository,
            SolicitudCentroRepository solicitudCentroRepository,
            UsuarioRepository usuarioRepository,
            PuntoAyudaRepository puntoAyudaRepository,
            VoluntariadoRepository voluntariadoRepository,
            PostulacionRepository postulacionRepository,
            DonacionRepository donacionRepository) {

        this.centroRepository = centroRepository;
        this.solicitudCentroRepository = solicitudCentroRepository;
        this.usuarioRepository = usuarioRepository;
        this.puntoAyudaRepository = puntoAyudaRepository;
        this.voluntariadoRepository = voluntariadoRepository;
        this.postulacionRepository = postulacionRepository;
        this.donacionRepository = donacionRepository;
    }

    @Transactional(readOnly = true)
    public DashboardDTO obtenerResumen() {

        DashboardDTO dto = new DashboardDTO();

        dto.setTotalCentros(
                centroRepository.count());
        dto.setCentrosPendientes(
                centroRepository.countByEstadoVerificacion(
                        EstadoVerificacion.PENDIENTE));
        dto.setCentrosVerificados(
                centroRepository.countByEstadoVerificacion(
                        EstadoVerificacion.VERIFICADO));

        dto.setTotalSolicitudesCentro(
                solicitudCentroRepository.count());
        dto.setSolicitudesCentroPendientes(
                solicitudCentroRepository.countByEstado(
                        EstadoVerificacion.PENDIENTE));

        dto.setTotalUsuarios(usuarioRepository.count());
        dto.setTotalPuntosAyuda(puntoAyudaRepository.count());
        dto.setTotalVoluntariados(voluntariadoRepository.count());
        dto.setTotalPostulaciones(postulacionRepository.count());
        dto.setTotalDonaciones(donacionRepository.count());

        return dto;
    }
}
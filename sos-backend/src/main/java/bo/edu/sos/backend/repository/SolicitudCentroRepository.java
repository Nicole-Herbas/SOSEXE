package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.SolicitudCentro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudCentroRepository
        extends JpaRepository<SolicitudCentro, Long> {

    List<SolicitudCentro> findByEstado(String estado);
        long countByEstado(String estado);
}
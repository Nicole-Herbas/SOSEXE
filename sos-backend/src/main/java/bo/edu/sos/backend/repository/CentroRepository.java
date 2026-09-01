package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.Centro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CentroRepository extends JpaRepository<Centro, Long> {

    List<Centro> findByEstadoVerificacion(String estadoVerificacion);
}
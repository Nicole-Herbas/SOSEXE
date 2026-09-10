package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.PuntoAyuda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PuntoAyudaRepository extends JpaRepository<PuntoAyuda, Long> {

    List<PuntoAyuda> findByDepartamentoId(Long departamentoId);

    List<PuntoAyuda> findByEstadoVerificacion(String estadoVerificacion);
}

package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.Alerta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {

    List<Alerta> findByDepartamentoId(Long departamentoId);

    List<Alerta> findByEstado(String estado);

    List<Alerta> findByEstadoAndFechaExpiracionAfter(
            String estado,
            LocalDateTime fecha);

    long countByEstado(String estado);
}
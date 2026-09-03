package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.Voluntariado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VoluntariadoRepository extends JpaRepository<Voluntariado, Long> {

    List<Voluntariado> findByCentroId(Long centroId);

    List<Voluntariado> findByEstado(String estado);
}

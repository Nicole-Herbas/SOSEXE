package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.Voluntariado;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VoluntariadoRepository extends JpaRepository<Voluntariado, Long> {

    List<Voluntariado> findByCentroId(Long centroId);

    // Precarga las relaciones usadas por el DTO del listado, sin cambiar los otros accesos.
    @EntityGraph(attributePaths = {"centro", "centro.departamento", "centro.necesidades"})
    List<Voluntariado> findByEstado(String estado);
}

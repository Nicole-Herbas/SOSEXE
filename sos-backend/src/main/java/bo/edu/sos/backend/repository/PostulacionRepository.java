package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.Postulacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostulacionRepository extends JpaRepository<Postulacion, Long> {

    List<Postulacion> findByVoluntariadoId(Long voluntariadoId);

    List<Postulacion> findByUsuarioId(Long usuarioId);

    boolean existsByVoluntariadoIdAndUsuarioId(Long voluntariadoId, Long usuarioId);
}

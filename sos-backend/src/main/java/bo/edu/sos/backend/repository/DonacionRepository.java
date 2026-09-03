package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.Donacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonacionRepository extends JpaRepository<Donacion, Long> {

    List<Donacion> findByCentroId(Long centroId);

    List<Donacion> findByUsuarioId(Long usuarioId);
}

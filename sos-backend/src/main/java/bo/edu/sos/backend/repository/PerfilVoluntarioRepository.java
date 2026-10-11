package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.PerfilVoluntario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilVoluntarioRepository extends JpaRepository<PerfilVoluntario, Long> {

    Optional<PerfilVoluntario> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioId(Long usuarioId);
}

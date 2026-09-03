package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.SuscripcionSms;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuscripcionSmsRepository extends JpaRepository<SuscripcionSms, Long> {

    Optional<SuscripcionSms> findByUsuarioId(Long usuarioId);
}

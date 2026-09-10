package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.EnvioSms;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnvioSmsRepository extends JpaRepository<EnvioSms, Long> {

    List<EnvioSms> findByAlertaId(Long alertaId);
}

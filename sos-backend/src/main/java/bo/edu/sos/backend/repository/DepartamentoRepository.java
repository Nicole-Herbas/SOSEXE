package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {
}
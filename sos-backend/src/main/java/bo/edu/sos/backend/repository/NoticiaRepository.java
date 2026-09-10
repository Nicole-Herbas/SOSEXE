package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticiaRepository extends JpaRepository<Noticia, Long> {

    List<Noticia> findByEstado(String estado);

    List<Noticia> findByCategoria(String categoria);
}

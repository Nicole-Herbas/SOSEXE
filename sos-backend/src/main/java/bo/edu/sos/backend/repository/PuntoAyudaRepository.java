package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.PuntoAyuda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PuntoAyudaRepository extends JpaRepository<PuntoAyuda, Long> {

    @EntityGraph(attributePaths = {"departamento", "necesidades"})
    @Query("""
            select p from PuntoAyuda p
            where p.estadoVerificacion = :estado
              and (:tipo is null or p.tipo = :tipo)
              and (:departamentoId is null or p.departamento.id = :departamentoId)
              and (:buscar is null or lower(p.nombre) like :buscar escape '!'
                   or lower(p.ciudad) like :buscar escape '!')
            order by p.fechaCreacion desc, p.id desc
            """)
    List<PuntoAyuda> buscarParaRevision(
            @Param("estado") String estado,
            @Param("tipo") String tipo,
            @Param("departamentoId") Long departamentoId,
            @Param("buscar") String buscar);

    List<PuntoAyuda> findByDepartamentoId(Long departamentoId);

    List<PuntoAyuda> findByEstadoVerificacion(String estadoVerificacion);

    long countByEstadoVerificacion(String estadoVerificacion);

    List<PuntoAyuda> findByCreadorIdOrderByFechaCreacionDesc(Long creadorId);
}

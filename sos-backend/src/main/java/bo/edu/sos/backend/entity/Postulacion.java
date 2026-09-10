package bo.edu.sos.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "postulacion",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_postulacion_usuario_voluntariado",
                columnNames = {"voluntariado_id", "usuario_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Postulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voluntariado_id", nullable = false)
    private Voluntariado voluntariado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_postulacion", nullable = false, insertable = false, updatable = false)
    private LocalDateTime fechaPostulacion;

    @Column(nullable = false, length = 30)
    private String estado = "PENDIENTE";

    @Column(length = 255)
    private String disponibilidad;

    @Column(length = 500)
    private String comentario;
}

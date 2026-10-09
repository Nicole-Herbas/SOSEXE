package bo.edu.sos.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "perfil_voluntario")
@Getter
@Setter
@NoArgsConstructor
public class PerfilVoluntario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false, length = 20)
    private String telefono;

    @Column(name = "email_contacto", nullable = false, length = 150)
    private String emailContacto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Column(nullable = false, length = 100)
    private String ciudad;

    /** Habilidades separadas por coma: "Primeros auxilios,Logística" */
    @Column(nullable = false, length = 500)
    private String habilidades;

    /** Disponibilidad separada por coma: "Días de semana,Mañana" */
    @Column(nullable = false, length = 500)
    private String disponibilidad;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", insertable = false, updatable = false)
    private LocalDateTime fechaActualizacion;
}

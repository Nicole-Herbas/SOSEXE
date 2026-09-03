package bo.edu.sos.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "punto_ayuda")
@Getter
@Setter
@NoArgsConstructor
public class PuntoAyuda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 40)
    private String tipo;

    @Column(length = 500)
    private String descripcion;

    @Column(length = 250)
    private String direccion;

    @Column(length = 100)
    private String ciudad;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitud;

    @Column(name = "estado_verificacion", nullable = false, length = 30)
    private String estadoVerificacion = "PENDIENTE";

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creador_id", nullable = false)
    private Usuario creador;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "punto_necesidad",
            joinColumns = @JoinColumn(name = "punto_id"),
            inverseJoinColumns = @JoinColumn(name = "necesidad_id")
    )
    private Set<Necesidad> necesidades = new HashSet<>();

    @Column(name = "fecha_creacion", nullable = false, insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", nullable = false, insertable = false, updatable = false)
    private LocalDateTime fechaActualizacion;
}
